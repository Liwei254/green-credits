import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };
type Row = { user: string; total: bigint };

const Leaderboard: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { verifier } = await getContracts(provider);
      const count: bigint = await verifier.getActionCount();
      const limit = Number(count > 100n ? 100n : count);
      const start = Number(count) - limit;

      const map = new Map<string, bigint>();
      for (let i = start; i < Number(count); i++) {
        const act = await verifier.actions(i);
        // act shape: [user, description,(proofCid,) reward, verified, timestamp]
        const user = act.user as string;
        const reward = BigInt(act.reward ?? 0n);
        const verified = Boolean(act.verified);
        if (verified) map.set(user, (map.get(user) ?? 0n) + reward);
      }

      const items = Array.from(map.entries()).map(([user, total]) => ({ user, total }));
      items.sort((a, b) => (a.total > b.total ? -1 : 1));
      setRows(items.slice(0, 10));
    })().catch(console.error).finally(() => setLoading(false));
  }, [provider]);

  const format = (x: bigint) => (Number(x) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🏆 Leaderboard</h3>
      <p className="text-sm text-gray-600 mb-4">Top contributors earning Green Credit Tokens</p>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="loading h-4 w-24"></div>
              <div className="loading h-4 w-16"></div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-center py-8">🌱 No verified actions yet. Start contributing!</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, index) => (
            <div key={r.user} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                  index === 0 ? 'bg-yellow-500 rank-1' :
                  index === 1 ? 'bg-gray-400 rank-2' :
                  index === 2 ? 'bg-amber-600 rank-3' :
                  'bg-gray-300'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{r.user.slice(0, 6)}...{r.user.slice(-4)}</div>
                  <div className="text-sm text-gray-500">Verified contributor</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600 text-lg">{format(r.total)} GCT</div>
                <div className="text-sm text-gray-500">Earned tokens</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;