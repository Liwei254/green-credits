import React, { useState } from "react";
import { BrowserProvider, id as ethersId } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const AdminRegistry: React.FC<Props> = ({ provider }) => {
  // Methodology form state
  const [methodLabel, setMethodLabel] = useState("");
  const [methodName, setMethodName] = useState("");
  const [methodVersion, setMethodVersion] = useState("");
  const [methodCid, setMethodCid] = useState("");
  const [methodActive, setMethodActive] = useState(true);
  const [methodBusy, setMethodBusy] = useState(false);

  // Baseline form state
  const [baselineLabel, setBaselineLabel] = useState("");
  const [projectLabel, setProjectLabel] = useState("");
  const [baselineVersion, setBaselineVersion] = useState("");
  const [baselineCid, setBaselineCid] = useState("");
  const [baselineActive, setBaselineActive] = useState(true);
  const [baselineBusy, setBaselineBusy] = useState(false);

  const upsertMethodology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodLabel.trim() || !methodName.trim() || !methodVersion.trim()) {
      return toast.error("All fields are required");
    }

    setMethodBusy(true);
    try {
      const { methodologyRegistryWithSigner } = await getContracts(provider, true);
      if (!methodologyRegistryWithSigner) {
        return toast.error("Methodology registry not configured");
      }

      const id = ethersId(methodLabel.trim());
      const tx = await methodologyRegistryWithSigner.upsert(
        id,
        methodName.trim(),
        methodVersion.trim(),
        methodCid.trim() || "",
        methodActive
      );
      await tx.wait();

      toast.success(`Methodology upserted: ${methodLabel}`);
      // Reset form
      setMethodLabel("");
      setMethodName("");
      setMethodVersion("");
      setMethodCid("");
      setMethodActive(true);
    } catch (e: any) {
      toast.error(e.message ?? "Upsert failed");
    } finally {
      setMethodBusy(false);
    }
  };

  const upsertBaseline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baselineLabel.trim() || !projectLabel.trim() || !baselineVersion.trim()) {
      return toast.error("All fields are required");
    }

    setBaselineBusy(true);
    try {
      const { baselineRegistryWithSigner } = await getContracts(provider, true);
      if (!baselineRegistryWithSigner) {
        return toast.error("Baseline registry not configured");
      }

      const id = ethersId(baselineLabel.trim());
      const projectId = ethersId(projectLabel.trim());
      const tx = await baselineRegistryWithSigner.upsert(
        id,
        projectId,
        baselineVersion.trim(),
        baselineCid.trim() || "",
        baselineActive
      );
      await tx.wait();

      toast.success(`Baseline upserted: ${baselineLabel}`);
      // Reset form
      setBaselineLabel("");
      setProjectLabel("");
      setBaselineVersion("");
      setBaselineCid("");
      setBaselineActive(true);
    } catch (e: any) {
      toast.error(e.message ?? "Upsert failed");
    } finally {
      setBaselineBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gray-800">🔧 Registry Administration</h2>
        <p className="text-gray-600">Manage methodology and baseline registry entries (owner only)</p>
      </div>

      {/* Methodology Registry */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📚 Methodology Registry</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upsert methodology entries. The label will be hashed to create the unique ID.
        </p>
        <form onSubmit={upsertMethodology} className="space-y-4">
          <div className="form-group">
            <label className="label">Methodology Label (for ID generation)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Cookstove v1.2"
              value={methodLabel}
              onChange={(e) => setMethodLabel(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be hashed with keccak256 to create the ID
            </p>
          </div>

          <div className="form-group">
            <label className="label">Name</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Clean Cookstove Distribution"
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Version</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., v1.2"
              value={methodVersion}
              onChange={(e) => setMethodVersion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">IPFS CID (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., bafkreiexample123..."
              value={methodCid}
              onChange={(e) => setMethodCid(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              IPFS content identifier for methodology document
            </p>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={methodActive}
                onChange={(e) => setMethodActive(e.target.checked)}
              />
              <span className="label">Active</span>
            </label>
          </div>

          <button type="submit" disabled={methodBusy} className="btn btn-primary w-full">
            {methodBusy ? "⏳ Upserting..." : "💾 Upsert Methodology"}
          </button>
        </form>
      </div>

      {/* Baseline Registry */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Baseline Registry</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upsert baseline entries. The label will be hashed to create the unique ID.
        </p>
        <form onSubmit={upsertBaseline} className="space-y-4">
          <div className="form-group">
            <label className="label">Baseline Label (for ID generation)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Baseline Kenya 001 v1"
              value={baselineLabel}
              onChange={(e) => setBaselineLabel(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be hashed with keccak256 to create the ID
            </p>
          </div>

          <div className="form-group">
            <label className="label">Project Label (for project ID generation)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., Project Kenya 001"
              value={projectLabel}
              onChange={(e) => setProjectLabel(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Version</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., v1.0"
              value={baselineVersion}
              onChange={(e) => setBaselineVersion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">IPFS CID (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g., bafkreiexample456..."
              value={baselineCid}
              onChange={(e) => setBaselineCid(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              IPFS content identifier for baseline document
            </p>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={baselineActive}
                onChange={(e) => setBaselineActive(e.target.checked)}
              />
              <span className="label">Active</span>
            </label>
          </div>

          <button type="submit" disabled={baselineBusy} className="btn btn-primary w-full">
            {baselineBusy ? "⏳ Upserting..." : "💾 Upsert Baseline"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistry;
