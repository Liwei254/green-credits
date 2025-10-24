export type UploadResult = { cid: string; url: string };

// Direct Storacha/Web3.Storage upload (demo-fast)
// Set VITE_WEB3_STORAGE_TOKEN in .env
async function uploadWeb3Storage(file: File): Promise<UploadResult> {
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string;
  if (!token) throw new Error("Missing VITE_WEB3_STORAGE_TOKEN");
  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream"
    },
    body: file
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Web3.Storage upload failed: ${res.status} ${res.statusText} ${text}`);
  }
  const json = await res.json();
  const cid: string = json.cid || json.value?.cid;
  return { cid, url: `https://w3s.link/ipfs/${cid}` };
}

// Secure proxy upload (recommended later)
// Set VITE_UPLOAD_PROXY_URL and run server/
async function uploadViaProxy(file: File): Promise<UploadResult> {
  const url = import.meta.env.VITE_UPLOAD_PROXY_URL as string;
  if (!url) throw new Error("Missing VITE_UPLOAD_PROXY_URL");
  const form = new FormData();
  form.append("file", file, file.name);
  // You can extend this to include signed auth later
  const r = await fetch(url, { method: "POST", body: form });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Proxy upload failed: ${r.status} ${r.statusText} ${text}`);
  }
  return r.json();
}

export async function uploadProof(file: File): Promise<UploadResult> {
  if (import.meta.env.VITE_UPLOAD_PROXY_URL) {
    return uploadViaProxy(file);
  }
  return uploadWeb3Storage(file);
}