import { NFTStorage } from 'nft.storage';

export type UploadResult = { cid: string; url: string };

// Direct NFT.storage upload using API token
// Requires VITE_NFT_STORAGE_TOKEN in .env
async function uploadNFTStorage(file: File): Promise<UploadResult> {
  const token = import.meta.env.VITE_NFT_STORAGE_TOKEN as string;
  if (!token) throw new Error("Missing VITE_NFT_STORAGE_TOKEN");

  // Create client
  const client = new NFTStorage({ token });

  // Upload file
  const cid = await client.storeBlob(new Blob([file]));
  return { cid: cid.toString(), url: `https://nftstorage.link/ipfs/${cid.toString()}` };
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

// Client-side AES-GCM encryption for private proofs
async function encryptFile(file: File): Promise<{ encryptedFile: File; key: string }> {
  // Generate a random 256-bit key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  // Export key as hex string for storage
  const keyData = await crypto.subtle.exportKey('raw', key);
  const keyHex = Array.from(new Uint8Array(keyData))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the file
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Create new file with encrypted content
  const encryptedFile = new File([combined], file.name + '.encrypted', {
    type: 'application/octet-stream'
  });

  return { encryptedFile, key: keyHex };
}

export async function uploadProof(file: File, options: { stripEXIF?: boolean; private?: boolean } = {}): Promise<UploadResult & { pHash?: string; encryptionKey?: string }> {
  const shouldStripEXIF = options.stripEXIF !== false; // Default to true
  const isPrivate = options.private || false;

  // Compute perceptual hash before processing
  const pHash = await computePerceptualHash(file);

  // Strip EXIF if requested (default)
  let processedFile = await stripEXIF(file, shouldStripEXIF);

  // Encrypt if private
  let encryptionKey: string | undefined;
  if (isPrivate) {
    const { encryptedFile, key } = await encryptFile(processedFile);
    processedFile = encryptedFile;
    encryptionKey = key;
  }

  // Prefer proxy for security (NFT.storage via server)
  let result: UploadResult;
  if (import.meta.env.VITE_UPLOAD_PROXY_URL) {
    result = await uploadViaProxy(processedFile);
  } else {
    // Fallback to direct NFT.storage (requires API token)
    result = await uploadNFTStorage(processedFile);
  }

  return { ...result, pHash, encryptionKey };
}
