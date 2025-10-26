import React, { useEffect, useState } from "react";
import { BrowserProvider, formatUnits } from "ethers";
import { getContracts } from "../utils/contract";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Props = { provider: BrowserProvider; address: string };

const Dashboard: React.FC<Props> = ({ provider, address }) => {
  const [balance, setBalance] = useState<string>("0");
  const [actions, setActions] = useState<number>(0);
  const [verifiedActions, setVerifiedActions] = useState<number>(0);
  const [co2Offset, setCo2Offset] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { token, verifier } = await getContracts(provider);
      const [bal, count] = await Promise.all([token.balanceOf(address), verifier.getActionCount()]);
      setBalance(formatUnits(bal, 18));
      setActions(Number(count));

      // Calculate verified actions and CO2 offset
      let verified = 0;
      let totalReward = 0n;
      for (let i = 0; i < Number(count); i++) {
        const act = await verifier.actions(i);
        if (act.verified) {
          verified++;
          totalReward += BigInt(act.reward ?? 0n);
        }
      }
      setVerifiedActions(verified);
      // Estimate CO2 offset based on rewards (simplified calculation)
      setCo2Offset(Number(totalReward) / 1e18 * 0.1); // 0.1 kg CO2 per GCT
    })().catch(console.error);
  }, [provider, address]);

  // Mock data for chart - in real app, this would come from on-chain data
  const chartData = [
    { name: 'Jan', tokens: 10 },
    { name: 'Feb', tokens: 25 },
    { name: 'Mar', tokens: 45 },
    { name: 'Apr', tokens: 80 },
    { name: 'May', tokens: 120 },
    { name: 'Jun', tokens: Number(balance) }
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="impact-stat">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💰</span>
            <div className="text-gray-500 text-sm font-medium">GCT Balance</div>
          </div>
          <div className="number">{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
          <div className="label">Green Credit Tokens</div>
        </div>
        <div className="impact-stat">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌍</span>
            <div className="text-gray-500 text-sm font-medium">Verified Actions</div>
          </div>
          <div className="number">{verifiedActions}</div>
          <div className="label">Actions rewarded</div>
        </div>
        <div className="impact-stat">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌱</span>
            <div className="text-gray-500 text-sm font-medium">CO₂ Offset</div>
          </div>
          <div className="number">{co2Offset.toFixed(1)}</div>
          <div className="label">Kilograms reduced</div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">📈 Token Growth Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#6DC24B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">🌕 Connected to Moonbeam Network</h3>
        <p className="text-gray-600">Your impact is transparently recorded on the Polkadot ecosystem, ensuring trust and immutability.</p>
      </div>
    </div>
  );
};

export default Dashboard;
