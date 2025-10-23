export async function uploadToIPFS(file: File): Promise<string> {
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
  if (!res.ok) throw new Error(`Web3.Storage upload failed: ${res.statusText}`);
  const { cid } = await res.json();
  return cid; // ipfs CID
}