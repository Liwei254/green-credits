import React, { useState, useRef } from "react";
import { BrowserProvider, id as ethersId } from "ethers";
import { useNavigate } from "react-router-dom";
import { getContracts } from "../utils/contract";
import { uploadProof } from "../utils/ipfs";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const MAX_MB = 8;

const ActionForm: React.FC<Props> = ({ provider }) => {
  const navigate = useNavigate();
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // V2 fields
  const [creditType, setCreditType] = useState<number>(0);
  const [methodology, setMethodology] = useState("");
  const [projectLabel, setProjectLabel] = useState("");
  const [baselineLabel, setBaselineLabel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [durability, setDurability] = useState("");
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.size > MAX_MB * 1024 * 1024) {
      toast.error(`Max file size ${MAX_MB}MB`);
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return toast.error("Description is required");
    if (file && file.size > MAX_MB * 1024 * 1024) return toast.error(`Max file size ${MAX_MB}MB`);

    if (!methodology.trim()) return toast.error("Methodology is required");
    if (!projectLabel.trim()) return toast.error("Project label is required");
    if (!baselineLabel.trim()) return toast.error("Baseline label is required");
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return toast.error("Valid quantity is required (grams CO2e)");
    }

    setBusy(true);
    setUploadProgress(0);
    try {
      let proofCid = "";
      if (file) {
        setUploadProgress(10);
        const { cid: uploaded } = await uploadProof(file, { private: isPrivate });
        proofCid = uploaded;
        setUploadProgress(50);
      }

      const { verifierWithSigner } = await getContracts(provider, true);
      setUploadProgress(70);

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

      setUploadProgress(100);
      // Reset form
      setDesc("");
      setFile(null);
      setIsPrivate(false);
      setMethodology("");
      setProjectLabel("");
      setBaselineLabel("");
      setQuantity("");
      setUncertainty("");
      setDurability("");
      setMetadataFile(null);
      toast.success("Action submitted!");
      navigate("/actions");
    } catch (e: any) {
      toast.error(e.message ?? "Submit failed");
    } finally {
      setBusy(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🌱 Submit Eco-Action</h3>
      <p className="text-sm text-gray-600 mb-4">Share your positive environmental impact and earn GCT tokens</p>
      <form onSubmit={submit} className="space-y-6">
        {/* Action Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">📝 Action Details</h4>
          <div className="form-group">
            <label className="label">What did you do?</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Describe your eco-friendly action. For example: 'Planted 5 trees in the local park' or 'Organized a neighborhood clean-up event'"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Be specific so others can understand and verify your impact</p>
          </div>
        </div>

        {/* Carbon Credit Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">🌿 Carbon Credit Details</h4>
          <div className="form-group">
            <label className="label">Type of Credit</label>
            <select
              className="input"
              value={creditType}
              onChange={(e) => setCreditType(Number(e.target.value))}
              required
            >
              <option value={0}>Reduction (cutting emissions)</option>
              <option value={1}>Removal (taking CO2 out of the air)</option>
              <option value={2}>Avoidance (preventing future emissions)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the type that best matches your action</p>
          </div>

          <div className="form-group">
            <label className="label">Methodology</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Tree Planting v2.0"
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">The standard or method used to calculate your impact</p>
          </div>

          <div className="form-group">
            <label className="label">Project Name</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Local Park Restoration"
              value={projectLabel}
              onChange={(e) => setProjectLabel(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">A unique name for your project</p>
          </div>

          <div className="form-group">
            <label className="label">Baseline</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Standard Urban Baseline"
              value={baselineLabel}
              onChange={(e) => setBaselineLabel(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">The reference point for measuring your impact</p>
          </div>

          <div className="form-group">
            <label className="label">Impact Amount (grams CO2e)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 500000 (0.5 tons)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">How much CO2 equivalent did you offset? 1 ton = 1,000,000 grams</p>
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <span className="text-sm font-medium">⚙️ Advanced Options</span>
            <span>{showAdvanced ? '▼' : '▶'}</span>
          </button>
          {showAdvanced && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              <div className="form-group">
                <label className="label">Uncertainty (optional)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g., 500 (5%)"
                  value={uncertainty}
                  onChange={(e) => setUncertainty(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Measurement uncertainty in basis points (100 = 1%)</p>
              </div>

              <div className="form-group">
                <label className="label">Durability (years, for removals)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g., 100"
                  value={durability}
                  onChange={(e) => setDurability(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">How long will the CO2 stay removed?</p>
              </div>

              <div className="form-group">
                <label className="label">Extra Data File (optional)</label>
                <input
                  className="input"
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setMetadataFile(e.target.files?.[0] ?? null)}
                />
                {metadataFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {metadataFile.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">JSON file with additional technical details</p>
              </div>
            </div>
          )}
        </div>

        {/* Proof & Submission Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">📸 Proof & Submission</h4>
          <div className="form-group">
            <label className="label">Photo Proof (optional)</label>

            {/* Drag and drop area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-w-full h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📸</div>
                  <p className="text-sm text-gray-600">
                    Drag & drop a photo here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPEG, WebP up to {MAX_MB}MB
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {/* Privacy checkbox */}
            {file && (
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private-proof"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="private-proof" className="text-sm text-gray-700">
                  Keep proof private (encrypted)
                </label>
              </div>
            )}

            {/* Upload progress */}
            {busy && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress < 50 ? 'Uploading proof...' : uploadProgress < 70 ? 'Processing...' : 'Submitting action...'}
                </p>
              </div>
            )}
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? "🌿 Submitting..." : "🌿 Submit Action"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActionForm;