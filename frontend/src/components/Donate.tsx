import React, { useState } from "react";
import { BrowserProvider, parseUnits } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const Donate: React.FC<Props> = ({ provider }) => {
  const [ngo, setNgo] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);

  const donate = async () => {
    setBusy(true);
    try {
      const { tokenWithSigner, poolWithSigner, pool } = await getContracts(provider, true);
      if (!pool || !poolWithSigner) {
        return toast.error("Donation pool not configured");
      }
      const wei = parseUnits(amount || "0", 18);
      // Approve pool
      const tx1 = await tokenWithSigner.approve(await pool.getAddress(), wei);
      await tx1.wait();
      // Check NGO allowlist
      const allowed = await poolWithSigner.isNGO(ngo);
      if (!allowed) {
        return toast.error("NGO address is not allowlisted");
      }
      const tx2 = await poolWithSigner.donateTo(ngo, wei);
      await tx2.wait();
      toast.success("Donation sent");
    } catch (e: any) {
      toast.error(e.message ?? "Donation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Donate GCT</h3>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="label">NGO Address</label>
          <input className="input" placeholder="0x..." value={ngo} onChange={(e) => setNgo(e.target.value)} />
        </div>
        <div>
          <label className="label">Amount (GCT)</label>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <button onClick={donate} disabled={busy} className="btn btn-primary mt-3">{busy ? "Donating..." : "Donate"}</button>
    </div>
  );
};

export default Donate;