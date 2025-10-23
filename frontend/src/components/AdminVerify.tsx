import React, { useEffect, useState } from "react";
import { BrowserProvider, parseUnits } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };

const AdminVerify: React.FC<Props> = ({ provider }) => {
  const [count, setCount] = useState<number>(0);
  const [selected, setSelected] = useState<number>(0);
  const [amount, setAmount] = useState<string>("10");
  const [isVerifier, setIsVerifier] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { verifier } = await getContracts(provider);
      const c: bigint = await verifier.getActionCount();
      setCount(Number(c));
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      try {
        const v = await verifier.isVerifier(me);
        setIsVerifier(v || me === (await verifier.owner()));
      } catch {
        setIsVerifier(false);
      }
    })().catch(console.error);
  }, [provider]);

  const verify = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const wei = parseUnits(amount, 18);
      const tx = await verifierWithSigner.verifyAction(selected, wei);
      await tx.wait();
      alert("Verified!");
    } catch (e: any) {
      alert(e.message ?? "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  if (!isVerifier) return <p>Not a verifier.</p>;

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <h3>Admin: Verify Action</h3>
      <div>
        <label>Action ID (0 - {count - 1}): </label>
        <input type="number" min={0} max={Math.max(0, count - 1)} value={selected} onChange={(e) => setSelected(Number(e.target.value))} />
      </div>
      <div style={{ marginTop: 6 }}>
        <label>Reward GCT: </label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <button style={{ marginTop: 8 }} onClick={verify} disabled={busy}>{busy ? "Verifying..." : "Verify"}</button>
    </div>
  );
};

export default AdminVerify;