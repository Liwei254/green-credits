import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";
import { uploadToIPFS } from "../utils/ipfs";

type Props = { provider: BrowserProvider };

const ActionForm: React.FC<Props> = ({ provider }) => {
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    setBusy(true);
    try {
      let cid = "";
      if (file) {
        cid = await uploadToIPFS(file);
      }
      const { verifierWithSigner } = await getContracts(provider, true);
      const tx = await verifierWithSigner.submitAction(desc.trim(), cid);
      await tx.wait();
      setDesc("");
      setFile(null);
      alert("Action submitted!");
    } catch (e: any) {
      alert(e.message ?? "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h3>Submit Eco-Action</h3>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="e.g., Planted 5 trees at City Park"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit"}</button>
        </div>
      </form>
    </div>
  );
};

export default ActionForm;