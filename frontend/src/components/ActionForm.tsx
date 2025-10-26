import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";
import { uploadProof } from "../utils/ipfs";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const MAX_MB = 8;

const ActionForm: React.FC<Props> = ({ provider }) => {
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return toast.error("Description is required");
    if (file && file.size > MAX_MB * 1024 * 1024) return toast.error(`Max file size ${MAX_MB}MB`);

    setBusy(true);
    try {
      let cid = "";
      if (file) {
        const { cid: uploaded } = await uploadProof(file);
        cid = uploaded;
      }

      const { verifierWithSigner } = await getContracts(provider, true);

      // Back-compat: if your contract doesn't support proofCid, append to description
      const hasProof = String(import.meta.env.VITE_VERIFIER_HAS_PROOF || "false") === "true";
      if (hasProof) {
        const tx = await verifierWithSigner.submitAction(desc.trim(), cid);
        await tx.wait();
      } else {
        const finalDesc = cid ? `${desc.trim()} | proof: ipfs://${cid}` : desc.trim();
        const tx = await verifierWithSigner.submitAction(finalDesc);
        await tx.wait();
      }

      setDesc("");
      setFile(null);
      toast.success("Action submitted!");
    } catch (e: any) {
      toast.error(e.message ?? "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🌱 Submit Eco-Action</h3>
      <p className="text-sm text-gray-600 mb-4">Share your positive environmental impact and earn GCT tokens</p>
      <form onSubmit={submit} className="space-y-4">
        <div className="form-group">
          <label className="label">Action Description</label>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="e.g., Planted 5 trees in the local park, organized a neighborhood clean-up, or reduced plastic usage by 50%..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Be specific about your action for better verification</p>
        </div>
        <div className="form-group">
          <label className="label">Proof Image (optional)</label>
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Upload photos to support your claim</p>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? "🌿 Submitting..." : "🌿 Submit Action"}
        </button>
      </form>
    </div>
  );
};

export default ActionForm;