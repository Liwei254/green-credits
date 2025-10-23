export type UploadResult = { cid: string; url: string };

export async function uploadToIPFS(file: File): Promise<UploadResult> {
  const provider = (import.meta.env.VITE_IPFS_PROVIDER || "web3").toLowerCase();

  if (provider === "pinata") {
    const jwt = import.meta.env.VITE_PINATA_JWT as string;
    if (!jwt) throw new Error("Missing VITE_PINATA_JWT");

    const form = new FormData();
    form.append("file", file, file.name);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`
      },
      body: form
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Pinata upload failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data = await res.json();
    const cid: string = data.IpfsHash;
    return { cid, url: `https://gateway.pinata.cloud/ipfs/${cid}` };
  }

  // default: web3.storage (Storacha)
  const token = import.meta.env.VITE_WEB3_STORAGE_TOKEN as string;
  if (!token) throw new Error("Missing VITE_WEB3_STORAGE_TOKEN");

  // Direct REST upload (works with the web3.storage service)
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
  const cid: string = json.cid || json.cidV1 || json.cidV0 || json.value?.cid;
  if (!cid) throw new Error("Upload succeeded but no CID found in response");
  return { cid, url: `https://w3s.link/ipfs/${cid}` };
}