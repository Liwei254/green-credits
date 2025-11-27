import React, { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { useLocation } from "react-router-dom";
import { getContracts, USE_V2 } from "../utils/contract";
import { resolveEns } from "../utils/network";

type Props = { provider: BrowserProvider };

type ActionRow = {
  id: number;
  user: string;
  description: string;
  proof?: string;
  verified: boolean;
  timestamp: number;
  reward: bigint;
  status: number;
  verifiedAt: number;
  verifier?: string;
  verifierEns?: string;
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

const Actions: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");
  const location = useLocation();

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const { verifier } = await getContracts(provider);
      const count: bigint = await verifier.actionCount();
      const limit = Number(count > 50n ? 50n : count);
      const start = Number(count) - limit;
      const temp: ActionRow[] = [];
      for (let i = start; i < Number(count); i++) {
        const act = await verifier.actions(i);
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
          reward: BigInt(act.reward ?? 0n),
          status: Number(act.status ?? 0),
          verifiedAt: Number(act.verifiedAt ?? 0),
        };

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

        if (row.verified) {
          try {
            const verifierAddr = await verifier.verifierOfAction(i);
            row.verifier = verifierAddr;
            if (verifierAddr && verifierAddr !== "0x0000000000000000000000000000000000000000") {
              const ens = await resolveEns(verifierAddr);
              row.verifierEns = ens || undefined;
            }
          } catch (e) {
            console.warn(`Could not fetch verifier for action ${i}:`, e);
          }
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

  useEffect(() => {
    if (location.pathname === "/actions") {
      fetchActions();
    }
  }, [location.pathname, fetchActions]);

  const filteredRows = rows.filter((row) => {
    switch (filter) {
      case "verified":
        return row.verified;
      case "pending":
        return !row.verified;
      default:
        return true;
    }
  });

  const getStatusBadge = (row: ActionRow) => {
    if (row.verified) {
      if (row.status === 2) return <span className="status-chip status-verified">🏆 Finalized</span>;
      return <span className="status-chip status-verified">✅ Verified</span>;
    }
    return <span className="status-chip status-pending">⏳ Pending</span>;
  };

  const getCreditTypeLabel = (creditType?: number) => {
    if (creditType === undefined) return null;
    return ["Reduction", "Removal", "Avoidance"][creditType] || "Unknown";
  };

  return (
    <div className="container-responsive">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex-between">
          <div>
            <h1 className="text-3xl font-bold text-white">📋 Actions List</h1>
            <p className="text-gray-400">All eco-actions submitted on-chain with verification status</p>
          </div>
          <button onClick={fetchActions} disabled={loading} className="btn btn-secondary">
            {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        <div className="flex-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {[
              { key: "all", label: "All Actions" },
              { key: "verified", label: "Verified Only" },
              { key: "pending", label: "Pending Only" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card">
                  <div className="flex-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="loading-skeleton h-6 w-20"></div>
                      <div className="loading-skeleton h-6 w-16"></div>
                      <div className="loading-skeleton h-6 w-12"></div>
                    </div>
                    <div className="loading-skeleton h-4 w-24"></div>
                  </div>
                  <div className="loading-skeleton h-4 w-full mb-3"></div>
                  <div className="loading-skeleton h-16 w-full mb-3"></div>
                  <div className="flex-between">
                    <div className="loading-skeleton h-4 w-20"></div>
                    <div className="flex gap-3">
                      <div className="loading-skeleton h-4 w-16"></div>
                      <div className="loading-skeleton h-4 w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="card">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {filter === "verified" ? "✅" : filter === "pending" ? "⏳" : "🌱"}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filter === "verified"
                    ? "No verified actions yet"
                    : filter === "pending"
                    ? "No pending actions"
                    : "No actions yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "verified"
                    ? "Verified actions will appear here once approved."
                    : filter === "pending"
                    ? "Pending actions are waiting for verification."
                    : "Be the first to submit an environmental action!"}
                </p>
                {filter === "all" && <button className="btn btn-primary btn-lg">Submit Your Action</button>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRows.map((r) => {
                const creditTypeLabel = getCreditTypeLabel(r.creditType);

                return (
                  <div key={r.id} className="card hover:shadow-md transition-shadow animate-fade-in">
                    <div className="flex-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Action #{r.id}</h3>
                        {getStatusBadge(r)}
                        {creditTypeLabel && <span className="status-chip status-info">{creditTypeLabel}</span>}
                        {r.verified && r.reward > 0n && (
                          <span className="text-sm font-bold text-success bg-success-bg px-2 py-1 rounded">
                            +{(Number(r.reward) / 1e18).toFixed(2)} GCT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(r.timestamp * 1000).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{r.description}</p>

                    {r.verified && r.verifier && (
                      <div className="bg-info-bg border border-info rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-info text-lg">✅</div>
                          <div className="text-sm font-semibold text-info">Verified by</div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {r.verifierEns ? (
                            <span className="font-mono text-info font-medium">{r.verifierEns}</span>
                          ) : (
                            <span className="font-mono text-info font-medium">
                              {r.verifier?.slice(0, 8)}...{r.verifier?.slice(-6)}
                            </span>
                          )}
                          {r.verifiedAt > 0 && (
                            <span className="text-gray-600 ml-2">
                              on {new Date(r.verifiedAt * 1000).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {USE_V2 && r.quantity !== undefined && r.quantity > 0n && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3">📊 Carbon Credit Details</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-medium">{Number(r.quantity).toLocaleString()} gCO2e</span>
                          </div>
                          {r.uncertaintyBps !== undefined && r.uncertaintyBps > 0n && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Uncertainty:</span>
                              <span className="font-medium">{Number(r.uncertaintyBps) / 100}%</span>
                            </div>
                          )}
                          {r.durabilityYears !== undefined && r.durabilityYears > 0n && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Durability:</span>
                              <span className="font-medium">{Number(r.durabilityYears)} years</span>
                            </div>
                          )}
                          {r.methodologyId &&
                            r.methodologyId !==
                              "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                              <div className="flex justify-between md:col-span-2">
                                <span className="text-gray-600">Methodology ID:</span>
                                <span className="font-mono text-xs font-medium">
                                  {r.methodologyId.slice(0, 16)}...
                                </span>
                              </div>
                            )}
                          {r.baselineId &&
                            r.baselineId !==
                              "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                              <div className="flex justify-between md:col-span-2">
                                <span className="text-gray-600">Baseline ID:</span>
                                <span className="font-mono text-xs font-medium">
                                  {r.baselineId.slice(0, 16)}...
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    <div className="flex-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">By:</span>
                        <span className="font-mono text-sm text-gray-700">
                          {r.user.slice(0, 8)}...{r.user.slice(-6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.proof && (
                          <a
                            className="text-primary hover:text-primary-hover text-sm font-medium hover:underline"
                            href={`https://w3s.link/ipfs/${r.proof}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📎 View Proof
                          </a>
                        )}
                        {r.metadataCid && (
                          <a
                            className="text-primary hover:text-primary-hover text-sm font-medium hover:underline"
                            href={`https://w3s.link/ipfs/${r.metadataCid}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📄 Metadata
                          </a>
                        )}
                        {r.attestationUID &&
                          r.attestationUID !==
                            "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                            <span className="text-xs text-purple-600 font-medium" title={r.attestationUID}>
                              🔐 Attested
                            </span>
                          )}
                        <a
                          href={`https://moonbase.moonscan.io/address/${r.user}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover text-sm font-medium hover:underline"
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
      </div>
    </div>
  );
};

export default Actions;
