import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { getContracts } from "../utils/contract";

type Props = {
  provider: BrowserProvider;
  address: string;
};

const Dashboard: React.FC<Props> = ({ provider, address }) => {
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const run = async () => {
      const { token } = await getContracts(provider);
      const bal = await token.balanceOf(address);
      setBalance(formatUnits(bal, 18));
    };
    run().catch(console.error);
  }, [provider, address]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h3>Dashboard</h3>
      <p>GCT Balance: {balance}</p>
    </div>
  );
};

export default Dashboard;
