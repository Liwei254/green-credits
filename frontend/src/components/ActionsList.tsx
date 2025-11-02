import React, { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { useLocation } from "react-router-dom";
import { getContracts, USE_V2 } from "../utils/contract";

type Props = { provider: BrowserProvider };

type ActionRow = {
  id: number;
  user: string;
  description: string;
  proof?: string;
  verified: boolean;
  timestamp: number;
  reward: bigint;
  // V2 fields
  creditType?: number;
  methodologyId?: string;
  projectId?: string;
  baselineId?: string;
  quantity?: bigint;
  uncertaintyBps?: bigint;
  durabilityYears?: bigint;
  metadataCid?: string;
  attestationUID?: string;
};

const ActionsList: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
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

        const row: ActionRow = {
          id: i,
          user: act.user,
          description,
          proof,
          verified: Boolean(act.verified),
          timestamp: Number(act.timestamp),
          reward: BigInt(act.reward ?? 0n)
        };

        // V2 fields if available
        if (USE_V2 && act.creditType !== undefined) {
          row.creditType = Number(act.creditType);
          row.methodologyId = act.methodologyId;
          row.projectId = act.projectId;
          row.baselineId = act.baselineId;
          row.quantity = BigInt(act.quantity ?? 0n);
          row.uncertaintyBps = BigInt(act.uncertaintyBps ?? 0n);
          row.durabilityYears = BigInt(act.durabilityYears ?? 0n);
          row.metadataCid = act.metadataCid;
          row.attestationUID = act.attestationUID;
        }

        temp.push(row);
      }
      temp.reverse();
      setRows(temp);
    } catch (error) {
      console.error("Failed to fetch actions:", error);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Auto-refresh when navigating to actions page (e.g., after submitting)
  useEffect(() => {
    if (location.pathname === '/actions') {
      fetchActions();
    }
  }, [location.pathname, fetchActions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">📋 Actions List</h3>
          <p className="text-sm text-gray-600">All eco-actions submitted on-chain with verification status</p>
        </div>
        <button onClick={fetchActions} disabled={loading} className="btn btn-sm">
          {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
        </button>
      </div>
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
          {rows.map((r) => {
            const creditTypeLabel = r.creditType !== undefined
              ? ['Reduction', 'Removal', 'Avoidance'][r.creditType] || 'Unknown'
              : null;
            
            return (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">Action #{r.id}</span>
                    <span className={`badge ${r.verified ? 'badge-verified' : 'badge-pending'}`}>
                      {r.verified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                    {creditTypeLabel && (
                      <span className="badge badge-info">{creditTypeLabel}</span>
                    )}
                    {r.verified && r.reward > 0n && (
                      <span className="text-sm font-medium text-green-600">
                        +{Number(r.reward) / 1e18} GCT
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(r.timestamp * 1000).toLocaleString()}</div>
                </div>
                <div className="font-medium text-gray-800 mb-3">{r.description}</div>

                {USE_V2 && r.quantity !== undefined && r.quantity > 0n && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-semibold">Quantity:</span> {Number(r.quantity).toLocaleString()} gCO2e
                      </div>
                      {r.uncertaintyBps !== undefined && r.uncertaintyBps > 0n && (
                        <div>
                          <span className="font-semibold">Uncertainty:</span> {Number(r.uncertaintyBps) / 100}%
                        </div>
                      )}
                      {r.durabilityYears !== undefined && r.durabilityYears > 0n && (
                        <div>
                          <span className="font-semibold">Durability:</span> {Number(r.durabilityYears)} years
                        </div>
                      )}
                      {r.methodologyId && r.methodologyId !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                        <div className="col-span-2">
                          <span className="font-semibold">Methodology ID:</span>{' '}
                          <span className="font-mono text-xs">{r.methodologyId.slice(0, 10)}...</span>
                        </div>
                      )}
                      {r.baselineId && r.baselineId !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                        <div className="col-span-2">
                          <span className="font-semibold">Baseline ID:</span>{' '}
                          <span className="font-mono text-xs">{r.baselineId.slice(0, 10)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                    {r.metadataCid && (
                      <a
                        className="text-blue-500 hover:text-blue-700 hover:underline"
                        href={`https://w3s.link/ipfs/${r.metadataCid}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📄 Metadata
                      </a>
                    )}
                    {r.attestationUID && r.attestationUID !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                      <span className="text-xs text-purple-600" title={r.attestationUID}>
                        🔐 Attested
                      </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionsList;