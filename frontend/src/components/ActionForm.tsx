import React, { useState } from "react";
import { BrowserProvider, id as ethersId } from "ethers";
import { useNavigate } from "react-router-dom";
import { getContracts, USE_V2 } from "../utils/contract";
import { uploadProof } from "../utils/ipfs";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const MAX_MB = 8;

const ActionForm: React.FC<Props> = ({ provider }) => {
  const navigate = useNavigate();
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // V2 fields
  const [creditType, setCreditType] = useState<number>(0);
  const [methodology, setMethodology] = useState("");
  const [projectLabel, setProjectLabel] = useState("");
  const [baselineLabel, setBaselineLabel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [durability, setDurability] = useState("");
  const [metadataFile, setMetadataFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return toast.error("Description is required");
    if (file && file.size > MAX_MB * 1024 * 1024) return toast.error(`Max file size ${MAX_MB}MB`);

    if (USE_V2) {
      if (!methodology.trim()) return toast.error("Methodology is required");
      if (!projectLabel.trim()) return toast.error("Project label is required");
      if (!baselineLabel.trim()) return toast.error("Baseline label is required");
      if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        return toast.error("Valid quantity is required (grams CO2e)");
      }
    }

    setBusy(true);
    try {
      let proofCid = "";
      if (file) {
        const { cid: uploaded } = await uploadProof(file);
        proofCid = uploaded;
      }

      const { verifierWithSigner } = await getContracts(provider, true);

      if (USE_V2) {
        // Upload metadata if provided
        let metadataCid = "";
        if (metadataFile) {
          const { cid: uploaded } = await uploadProof(metadataFile);
          metadataCid = uploaded;
        }

        // Hash labels to bytes32 IDs
        const methodologyId = ethersId(methodology.trim());
        const projectId = ethersId(projectLabel.trim());
        const baselineId = ethersId(baselineLabel.trim());

        const tx = await verifierWithSigner.submitActionV2(
          desc.trim(),
          proofCid,
          creditType,
          methodologyId,
          projectId,
          baselineId,
          quantity.trim(),
          uncertainty.trim() || "0",
          durability.trim() || "0",
          metadataCid
        );
        await tx.wait();
      } else {
        const tx = await verifierWithSigner.submitAction(desc.trim(), proofCid);
        await tx.wait();
      }

      // Reset form
      setDesc("");
      setFile(null);
      if (USE_V2) {
        setMethodology("");
        setProjectLabel("");
        setBaselineLabel("");
        setQuantity("");
        setUncertainty("");
        setDurability("");
        setMetadataFile(null);
      }
      toast.success("Action submitted!");
      navigate("/actions");
    } catch (e: any) {
      toast.error(e.message ?? "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🌱 Submit Eco-Action {USE_V2 && "(V2)"}</h3>
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

        {USE_V2 && (
          <>
            <div className="form-group">
              <label className="label">Credit Type</label>
              <select
                className="input"
                value={creditType}
                onChange={(e) => setCreditType(Number(e.target.value))}
                required
              >
                <option value={0}>Reduction</option>
                <option value={1}>Removal</option>
                <option value={2}>Avoidance</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Type of carbon credit</p>
            </div>

            <div className="form-group">
              <label className="label">Methodology</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., Cookstove v1.2"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Methodology name (will be hashed to ID)</p>
            </div>

            <div className="form-group">
              <label className="label">Project Label</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., Project Kenya 001"
                value={projectLabel}
                onChange={(e) => setProjectLabel(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Project identifier (will be hashed to ID)</p>
            </div>

            <div className="form-group">
              <label className="label">Baseline Label</label>
              <input
                className="input"
                type="text"
                placeholder="e.g., Baseline Kenya 001 v1"
                value={baselineLabel}
                onChange={(e) => setBaselineLabel(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Baseline identifier (will be hashed to ID)</p>
            </div>

            <div className="form-group">
              <label className="label">Quantity (grams CO2e)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 1000000 (1 ton = 1,000,000 grams)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Amount in grams of CO2 equivalent</p>
            </div>

            <div className="form-group">
              <label className="label">Uncertainty (basis points, optional)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 500 (5%)"
                value={uncertainty}
                onChange={(e) => setUncertainty(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">100 basis points = 1%</p>
            </div>

            <div className="form-group">
              <label className="label">Durability (years, for removals only)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g., 100 (for permanent removals)"
                value={durability}
                onChange={(e) => setDurability(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">For removal credits, expected permanence in years</p>
            </div>

            <div className="form-group">
              <label className="label">Metadata File (optional)</label>
              <input
                className="input"
                type="file"
                accept=".json,application/json"
                onChange={(e) => setMetadataFile(e.target.files?.[0] ?? null)}
              />
              {metadataFile && (
                <p className="text-sm text-gray-600 mt-1">Selected: {metadataFile.name}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">JSON file with additional metadata</p>
            </div>
          </>
        )}

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