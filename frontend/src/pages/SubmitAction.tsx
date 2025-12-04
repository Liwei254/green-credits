import React, { useRef, useState } from "react";
import { BrowserProvider, Contract, formatEther, formatUnits, id as ethersId, parseUnits } from "ethers";
import { useNavigate } from "react-router-dom";
import { getContracts, PatchedBrowserProvider, VERIFIER_ADDRESS, verifierAbi } from "../utils/contract";
import { uploadProof } from "../utils/ipfs";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { motion } from "framer-motion";
import { Leaf, Zap } from "lucide-react";

type Props = { provider: PatchedBrowserProvider };

const MAX_MB = 8;

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  totalCost: string;
}

const SubmitAction: React.FC<Props> = ({ provider }) => {
  const navigate = useNavigate();
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [creditType, setCreditType] = useState<number>(0);
  const [methodology, setMethodology] = useState("");
  const [projectLabel, setProjectLabel] = useState("");
  const [baselineLabel, setBaselineLabel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uncertainty, setUncertainty] = useState("");
  const [durability, setDurability] = useState("");
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [networkName, setNetworkName] = useState<string>("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proofCid, setProofCid] = useState("");
  const [metadataCid, setMetadataCid] = useState("");

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
      let newProofCid = "";
      if (file) {
        setUploadProgress(10);
        const { cid: uploaded } = await uploadProof(file, { private: isPrivate });
        newProofCid = uploaded;
        setProofCid(newProofCid);
        setUploadProgress(50);
      }

      let newMetadataCid = "";
      if (metadataFile) {
        const { cid: uploaded } = await uploadProof(metadataFile);
        newMetadataCid = uploaded;
        setMetadataCid(newMetadataCid);
      }

      setUploadProgress(70);
      setBusy(false);
      setShowConfirmModal(true);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
      setBusy(false);
      setUploadProgress(0);
    }
  };

  const estimateGas = async () => {
    if (!desc.trim() || !methodology.trim() || !projectLabel.trim() || !baselineLabel.trim() || !quantity.trim()) {
      toast.error("Please fill in all required fields before estimating gas");
      return;
    }

    setEstimatingGas(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);

      // Use patched provider methods to avoid ENS issues
      let feeData;
      try {
        feeData = await provider.getFeeData();
      } catch (error: any) {
        // Fallback to default gas price if getFeeData fails
        feeData = { gasPrice: parseUnits("20", "gwei") };
      }
      const gasPrice = feeData.gasPrice || parseUnits("20", "gwei");

      const methodologyId = ethersId(methodology.trim());
      const projectId = ethersId(projectLabel.trim());
      const baselineId = ethersId(baselineLabel.trim());

      const gasLimit = await verifierWithSigner.submitActionV2.estimateGas(
        desc.trim(),
        proofCid || "",
        creditType,
        methodologyId,
        projectId,
        baselineId,
        quantity.trim(),
        uncertainty.trim() || "0",
        durability.trim() || "0",
        metadataCid || ""
      );

      const totalCost = gasLimit * gasPrice;

      setGasEstimate({
        gasLimit: gasLimit.toString(),
        gasPrice: formatUnits(gasPrice, "gwei"),
        totalCost: formatEther(totalCost),
      });

      // Use patched getNetwork method
      try {
        const network = await provider.getNetwork();
        setNetworkName(network.name);
      } catch (error: any) {
        // Fallback to unknown network if getNetwork fails
        setNetworkName("Moonbeam");
      }

      toast.success("Gas estimate calculated successfully");
    } catch (e: any) {
      toast.error(e.message ?? "Gas estimation failed");
      setGasEstimate(null);
    } finally {
      setEstimatingGas(false);
    }
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setBusy(true);
    setUploadProgress(70);
    try {
      // Ensure provider is patched to prevent ENS resolution
      const patchedProvider = provider instanceof PatchedBrowserProvider ? provider : new PatchedBrowserProvider((provider as any)._provider || (provider as any).provider);
      const signer = await patchedProvider.getSigner();

      // Create contract directly with patched provider to avoid any ENS issues
      const verifierContract = new Contract(VERIFIER_ADDRESS, verifierAbi, signer);

      const methodologyId = ethersId(methodology.trim());
      const projectId = ethersId(projectLabel.trim());
      const baselineId = ethersId(baselineLabel.trim());

      const tx = await verifierContract.submitActionV2(
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
      setProofCid("");
      setMetadataCid("");
      setGasEstimate(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container-responsive py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Leaf className="w-16 h-16 text-green-400" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Submit Eco-Action
            </h1>
            <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
              🌿 Share your positive environmental impact and earn Green Credit Tokens
            </p>
          </motion.div>

          <form onSubmit={submit} className="space-y-8">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📝 Action Details</h2>
                <p className="card-description">Describe your environmental action and its impact</p>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">What did you do?</label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Describe your eco-friendly action. For example: 'Planted 5 trees in the local park' or 'Organized a neighborhood clean-up event'"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">Be specific so others can understand and verify your impact</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🌿 Carbon Credit Details</h2>
                <p className="card-description">Provide technical details for carbon credit calculation</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">Type of Credit</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                    value={creditType}
                    onChange={(e) => setCreditType(Number(e.target.value))}
                    required
                  >
                    <option value={0}>Reduction (cutting emissions)</option>
                    <option value={1}>Removal (taking CO2 out of the air)</option>
                    <option value={2}>Avoidance (preventing future emissions)</option>
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">Choose the type that best matches your action</p>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">Impact Amount (grams CO2e)</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                    type="number"
                    placeholder="e.g., 500000 (0.5 tons)"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">How much CO2 equivalent did you offset? 1 ton = 1,000,000 grams</p>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">Methodology</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                    type="text"
                    placeholder="e.g., Tree Planting v2.0"
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">The standard or method used to calculate your impact</p>
                </div>

                <div className="form-group">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">Project Name</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                    type="text"
                    placeholder="e.g., Local Park Restoration"
                    value={projectLabel}
                    onChange={(e) => setProjectLabel(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">A unique name for your project</p>
                </div>

                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-200 mb-2">Baseline</label>
                  <input
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200"
                    type="text"
                    placeholder="e.g., Standard Urban Baseline"
                    value={baselineLabel}
                    onChange={(e) => setBaselineLabel(e.target.value)}
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">The reference point for measuring your impact</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="card-title">⚙️ Advanced Options</h2>
                    <p className="card-description">Optional technical parameters for detailed carbon accounting</p>
                  </div>
                  <span className="text-xl">{showAdvanced ? "▼" : "▶"}</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
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
                  </div>

                  <div className="form-group">
                    <label className="label">Extra Data File (optional)</label>
                    <input
                      className="input"
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => setMetadataFile(e.target.files?.[0] ?? null)}
                    />
                    {metadataFile && <p className="text-sm text-gray-600 mt-1">Selected: {metadataFile.name}</p>}
                    <p className="text-xs text-gray-500 mt-1">JSON file with additional technical details</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📸 Proof & Submission</h2>
                <p className="card-description">Upload evidence and submit your action for verification</p>
              </div>

              <div className="space-y-6">
                <div className="form-group">
                  <label className="label">Photo Proof (optional but recommended)</label>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDragOver
                        ? "border-primary bg-primary-bg scale-105"
                        : file
                        ? "border-success bg-success-bg"
                        : "border-gray-300 hover:border-primary hover:bg-primary-bg"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded-lg mx-auto shadow-lg"
                          />
                          <div className="absolute top-2 right-2 bg-success text-white rounded-full p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-6xl text-gray-400">📸</div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drag & drop a photo here, or click to select
                          </p>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPEG, WebP up to {MAX_MB}MB</p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm text-primary font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Choose File
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />

                  {file && (
                    <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="private-proof"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div>
                        <label htmlFor="private-proof" className="text-sm font-medium text-gray-700">
                          Keep proof private (encrypted)
                        </label>
                        <p className="text-xs text-gray-500">Only verifiers can access encrypted proofs</p>
                      </div>
                    </div>
                  )}

                  {busy && uploadProgress > 0 && (
                    <div className="mt-6">
                      <div className="flex-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Submitting Action</span>
                        <span className="text-sm text-gray-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {uploadProgress < 50
                          ? "📤 Uploading proof..."
                          : uploadProgress < 70
                          ? "⚙️ Processing data..."
                          : uploadProgress < 100
                          ? "🔗 Submitting to blockchain..."
                          : "✅ Action submitted!"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Gas Estimation</label>
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={estimateGas}
                      disabled={estimatingGas || busy}
                      className="btn btn-outline flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {estimatingGas ? "Estimating..." : "Estimate Gas Cost"}
                    </button>

                    {gasEstimate && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Estimated Transaction Cost</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gas Limit:</span>
                            <span className="ml-2 font-mono">{gasEstimate.gasLimit}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gas Price:</span>
                            <span className="ml-2 font-mono">
                              {Number(gasEstimate.gasPrice).toFixed(2)} gwei
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Total Cost:</span>
                            <span className="ml-2 font-mono font-semibold text-blue-900">
                              {Number(gasEstimate.totalCost).toFixed(6)} ETH
                            </span>
                            {networkName && (
                              <span className="ml-2 text-xs text-gray-500">on {networkName}</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          This is an estimate. Actual costs may vary based on network conditions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!showConfirmModal && (
                  <div className="flex gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary flex-1">
                      Cancel
                    </button>
                    <button type="submit" disabled={busy} className="btn btn-primary btn-lg flex-1">
                      {busy ? "🌿 Submitting..." : "🚀 Submit Action"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          <ConfirmModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={confirmSubmit}
            title="Confirm Submission"
            confirmText="Submit Action"
            loading={busy}
          >
            <p>Are you sure you want to submit this eco-action?</p>
            <p className="text-sm text-gray-600 mt-2">
              This will upload your proof to IPFS and submit the action to the blockchain.
            </p>
          </ConfirmModal>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitAction;
