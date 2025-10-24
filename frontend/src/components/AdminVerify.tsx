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
      <h3 className="text-lg font-semibold mb-3">Admin: Verify Action</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Action ID (0 - {Math.max(0, count - 1)})</label>
          <input className="input" type="number" min={0} max={Math.max(0, count - 1)} value={selected} onChange={(e) => setSelected(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Reward (GCT)</label>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={verify} disabled={busy} className="btn btn-primary w-full">{busy ? "Verifying..." : "Verify"}</button>
        </div>
      </div>
    </div>
  );
};

export default AdminVerify;