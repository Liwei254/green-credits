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
      <h3 className="text-lg font-semibold mb-3">Leaderboard (recent)</h3>
      {loading ? <p>Loading...</p> : rows.length === 0 ? <p>No verified actions yet.</p> : (
        <ol className="space-y-2">
          {rows.map((r) => (
            <li key={r.user} className="flex justify-between">
              <span>{r.user.slice(0, 6)}...{r.user.slice(-4)}</span>
              <span className="font-medium">{format(r.total)} GCT</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;