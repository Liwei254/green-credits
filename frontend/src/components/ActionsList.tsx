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
      <h3 className="text-lg font-semibold mb-3">Recent Actions</h3>
      {loading ? <p>Loading...</p> : rows.length === 0 ? <p>No actions yet.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">ID #{r.id} — {r.verified ? <span className="text-green-600 font-medium">Verified</span> : <span className="text-yellow-600 font-medium">Pending</span>}</div>
                <div className="text-sm text-gray-500">{new Date(r.timestamp * 1000).toLocaleString()}</div>
              </div>
              <div className="mt-1 font-medium">{r.description}</div>
              <div className="mt-1 text-sm text-gray-600">By: {r.user.slice(0, 6)}...{r.user.slice(-4)}</div>
              {r.proof && (
                <a className="mt-2 inline-block text-sm text-brand hover:underline" href={`https://w3s.link/ipfs/${r.proof}`} target="_blank" rel="noreferrer">
                  View Proof (IPFS)
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionsList;