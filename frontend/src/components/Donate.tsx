import React, { useState } from "react";
import { BrowserProvider, parseUnits } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };

const Donate: React.FC<Props> = ({ provider }) => {
  const [ngo, setNgo] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);

  const donate = async () => {
    setBusy(true);
    try {
      const { tokenWithSigner } = await getContracts(provider, true);
      const VITE_DONATION_POOL = import.meta.env.VITE_DONATION_POOL_ADDRESS as string;
      const wei = parseUnits(amount, 18);
      // 1) approve
      const tx1 = await tokenWithSigner.approve(VITE_DONATION_POOL, wei);
      await tx1.wait();
      // 2) donate
      const poolAbi = [
        "function donateTo(address ngo, uint256 amount)",
        "function isNGO(address ngo) view returns (bool)"
      ];
      const { Contract } = await import("ethers");
      const pool = new Contract(VITE_DONATION_POOL, poolAbi, await provider.getSigner());
      const allowed = await pool.isNGO(ngo);
      if (!allowed) return alert("NGO is not allowlisted.");
      const tx2 = await pool.donateTo(ngo, wei);
      await tx2.wait();
      alert("Donation sent!");
    } catch (e: any) {
      alert(e.message ?? "Donation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
      <h3>Donate GCT</h3>
      <input placeholder="NGO address (0x...)" value={ngo} onChange={(e) => setNgo(e.target.value)} style={{ width: "100%", marginBottom: 8 }} />
      <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button onClick={donate} disabled={busy} style={{ marginLeft: 8 }}>{busy ? "Donating..." : "Donate"}</button>
    </div>
  );
};

export default Donate;