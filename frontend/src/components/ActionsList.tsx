import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };

type ActionRow = {
  id: number;
  user: string;
  description: string;
  proof?: string;
  verified: boolean;
  timestamp: number;
  reward: bigint;
};

const ActionsList: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { verifier } = await getContracts(provider);
      const count: bigint = await verifier.getActionCount();
      const limit = Number(count > 50n ? 50n : count);
      const start = Number(count) - limit;
      const temp: ActionRow[] = [];
      for (let i = start; i < Number(count); i++) {
        const act = await verifier.actions(i);
        // act may or may not include proofCid depending on contract
        const hasProof = act.proofCid !== undefined;
        const description = String(act.description);
        let proof = "";

        if (hasProof) {
          proof = act.proofCid as string;
        } else {
          const m = description.match(/proof:\s*ipfs:\/\/([^\s|]+)/i);
          proof = m?.[1] || "";
        }

        temp.push({
          id: i,
          user: act.user,
          description,
          proof,
          verified: Boolean(act.verified),
          timestamp: Number(act.timestamp),
          reward: BigInt(act.reward ?? 0n)
        });
      }
      temp.reverse();
      setRows(temp);
    })().catch(console.error).finally(() => setLoading(false));
  }, [provider]);

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">📋 Actions List</h3>
      <p className="text-sm text-gray-600 mb-4">All eco-actions submitted on-chain with verification status</p>
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="loading h-4 w-32 mb-2"></div>
              <div className="loading h-4 w-full mb-2"></div>
              <div className="loading h-3 w-24"></div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-center py-8">🌱 No actions yet. Be the first to submit!</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">Action #{r.id}</span>
                  <span className={`badge ${r.verified ? 'badge-verified' : 'badge-pending'}`}>
                    {r.verified ? '✅ Verified' : '⏳ Pending'}
                  </span>
                  {r.verified && r.reward > 0n && (
                    <span className="text-sm font-medium text-green-600">
                      +{Number(r.reward) / 1e18} GCT
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{new Date(r.timestamp * 1000).toLocaleString()}</div>
              </div>
              <div className="font-medium text-gray-800 mb-3">{r.description}</div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By: {r.user.slice(0, 6)}...{r.user.slice(-4)}</span>
                <div className="flex items-center gap-3">
                  {r.proof && (
                    <a
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                      href={`https://w3s.link/ipfs/${r.proof}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 View Proof
                    </a>
                  )}
                  <a
                    href={`https://moonbase.moonscan.io/address/${r.user}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View on MoonScan ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsList;