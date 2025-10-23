import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = {
  provider: BrowserProvider;
};

type Row = { user: string; total: bigint };

const Leaderboard: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const run = async () => {
      const { verifier } = await getContracts(provider);
      const count: bigint = await verifier.getActionCount();
      const limit = Number(count > 50n ? 50n : count); // last 50 actions
      const start = Number(count) - limit;

      // Aggregate rewards by user for recent actions
      const map = new Map<string, bigint>();
      for (let i = start; i < Number(count); i++) {
        const act = await verifier.actions(i);
        if (act.verified) {
          const prev = map.get(act.user) ?? 0n;
          map.set(act.user, prev + BigInt(act.reward));
        }
      }
      const items = Array.from(map.entries()).map(([user, total]) => ({ user, total }));
      items.sort((a, b) => (a.total > b.total ? -1 : 1));
      setRows(items.slice(0, 10));
    };
    run().catch(console.error);
  }, [provider]);

  const format = (x: bigint) => (Number(x) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <h3>Leaderboard (recent)</h3>
      {rows.length === 0 ? (
        <p>No verified actions yet.</p>
      ) : (
        <ol>
          {rows.map((r) => (
            <li key={r.user}>
              {r.user.slice(0, 6)}...{r.user.slice(-4)} — {format(r.total)} GCT
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;