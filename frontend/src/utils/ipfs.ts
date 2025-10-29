import * as Client from '@storacha/client';
import * as Delegation from '@storacha/client/delegation';

export type UploadResult = { cid: string; url: string };

// Direct Storacha upload using UCAN delegation
// Requires VITE_STORACHA_DELEGATION in .env (base64 encoded delegation archive)
async function uploadStoracha(file: File): Promise<UploadResult> {
  const delegationB64 = import.meta.env.VITE_STORACHA_DELEGATION as string;
  if (!delegationB64) throw new Error("Missing VITE_STORACHA_DELEGATION");

  // Create client
  const client = await Client.create();

  // Decode and extract delegation
  const delegationData = Uint8Array.from(atob(delegationB64), c => c.charCodeAt(0));
  const delegation = await Delegation.extract(delegationData);
  if (!delegation.ok) {
    throw new Error('Failed to extract delegation: ' + delegation.error);
  }

  // Add space and set current
  const space = await client.addSpace(delegation.ok);
  await client.setCurrentSpace(space.did());

  // Upload file
  const cid = await client.uploadFile(file);
  return { cid: cid.toString(), url: `https://w3s.link/ipfs/${cid.toString()}` };
}

// Secure proxy upload (recommended for production)
// Set VITE_UPLOAD_PROXY_URL and run server/
async function uploadViaProxy(file: File): Promise<UploadResult> {
  const url = import.meta.env.VITE_UPLOAD_PROXY_URL as string;
  if (!url) throw new Error("Missing VITE_UPLOAD_PROXY_URL");
  const form = new FormData();
  form.append("file", file, file.name);
  const r = await fetch(url, { method: "POST", body: form });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Proxy upload failed: ${r.status} ${r.statusText} ${text}`);
  }
  return r.json();
}

// Strip EXIF data from image files (default: true)
async function stripEXIF(file: File, strip: boolean = true): Promise<File> {
  if (!strip || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob (JPEG to reduce size)
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(newFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.9);
        } else {
          resolve(file);
        }
      };
      
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// Simple difference hash (dHash) for perceptual hashing
async function computePerceptualHash(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return '';
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        // Resize to 9x8 for dHash
        const canvas = document.createElement('canvas');
        const size = 9;
        canvas.width = size;
        canvas.height = size - 1;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve('');
          return;
        }

        ctx.drawImage(img, 0, 0, size, size - 1);
        const imageData = ctx.getImageData(0, 0, size, size - 1);
        const pixels = imageData.data;

        // Convert to grayscale and compute hash
        let hash = '';
        for (let row = 0; row < size - 1; row++) {
          for (let col = 0; col < size - 1; col++) {
            const idx = (row * size + col) * 4;
            const nextIdx = (row * size + col + 1) * 4;
            
            // Grayscale conversion
            const gray1 = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            const gray2 = (pixels[nextIdx] + pixels[nextIdx + 1] + pixels[nextIdx + 2]) / 3;
            
            hash += gray1 > gray2 ? '1' : '0';
          }
        }

        // Convert binary to hex
        const hexHash = parseInt(hash, 2).toString(16).padStart(16, '0');
        resolve(hexHash);
      };
      
      img.onerror = () => resolve('');
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function uploadProof(file: File, options: { stripEXIF?: boolean } = {}): Promise<UploadResult & { pHash?: string }> {
  const shouldStripEXIF = options.stripEXIF !== false; // Default to true

  // Compute perceptual hash before processing
  const pHash = await computePerceptualHash(file);

  // Strip EXIF if requested (default)
  const processedFile = await stripEXIF(file, shouldStripEXIF);

  // Prefer proxy for security (Storacha via server)
  let result: UploadResult;
  if (import.meta.env.VITE_UPLOAD_PROXY_URL) {
    result = await uploadViaProxy(processedFile);
  } else {
    // Fallback to direct Storacha (requires delegation)
    result = await uploadStoracha(processedFile);
  }

  return { ...result, pHash };
}
