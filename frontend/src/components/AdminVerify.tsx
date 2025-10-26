import React, { useEffect, useState } from "react";
import { BrowserProvider, parseUnits } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const AdminVerify: React.FC<Props> = ({ provider }) => {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState("10");
  const [isOwner, setIsOwner] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { verifier } = await getContracts(provider);
      const c: bigint = await verifier.getActionCount();
      setCount(Number(c));
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const owner = await verifier.owner();
      setIsOwner(me.toLowerCase() === owner.toLowerCase());
    })().catch(console.error);
  }, [provider]);

  const verify = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const wei = parseUnits(amount || "0", 18);
      const tx = await verifierWithSigner.verifyAction(selected, wei);
      await tx.wait();
      toast.success("Action verified");
    } catch (e: any) {
      toast.error(e.message ?? "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  if (!isOwner) return null;

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🔍 Admin: Verify Actions</h3>
      <p className="text-sm text-gray-600 mb-4">Review and verify eco-actions to reward contributors</p>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="label">Action ID</label>
          <input
            className="input"
            type="number"
            min={0}
            max={Math.max(0, count - 1)}
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0 - {Math.max(0, count - 1)}</p>
        </div>
        <div className="form-group">
          <label className="label">Reward Amount</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.00"
          />
          <p className="text-xs text-gray-500 mt-1">GCT tokens to award</p>
        </div>
        <div className="flex items-end">
          <button onClick={verify} disabled={busy} className="btn btn-primary w-full">
            {busy ? "🔄 Verifying..." : "✅ Verify & Reward"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerify;