import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = {
  provider: BrowserProvider;
};

const ActionForm: React.FC<Props> = ({ provider }) => {
  const [desc, setDesc] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    const { verifierWithSigner } = await getContracts(provider, true);
    const tx = await verifierWithSigner.submitAction(desc.trim());
    await tx.wait();
    setDesc("");
    alert("Action submitted!");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h3>Submit Eco-Action</h3>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="e.g., Planted 5 trees at City Park"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ActionForm;