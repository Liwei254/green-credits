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

export async function uploadProof(file: File): Promise<UploadResult> {
  // Prefer proxy for security (Storacha via server)
  if (import.meta.env.VITE_UPLOAD_PROXY_URL) {
    return uploadViaProxy(file);
  }
  // Fallback to direct Storacha (requires delegation)
  return uploadStoracha(file);
}
