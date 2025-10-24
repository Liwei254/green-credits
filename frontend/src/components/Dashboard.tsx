import React, { useEffect, useState } from "react";
import { BrowserProvider, formatUnits } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider; address: string };

const Dashboard: React.FC<Props> = ({ provider, address }) => {
  const [balance, setBalance] = useState<string>("0");
  const [actions, setActions] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { token, verifier } = await getContracts(provider);
      const [bal, count] = await Promise.all([token.balanceOf(address), verifier.getActionCount()]);
      setBalance(formatUnits(bal, 18));
      setActions(Number(count));
    })().catch(console.error);
  }, [provider, address]);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="card">
        <div className="text-gray-500 text-sm">GCT Balance</div>
        <div className="mt-1 text-2xl font-semibold">{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
      </div>
      <div className="card">
        <div className="text-gray-500 text-sm">Total Actions (on-chain)</div>
        <div className="mt-1 text-2xl font-semibold">{actions}</div>
      </div>
    </div>
  );
};

export default Dashboard;