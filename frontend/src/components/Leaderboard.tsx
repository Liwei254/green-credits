import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { getContracts } from "../utils/contract";

type Props = { provider: BrowserProvider };
type Row = { user: string; total: bigint };

const LeaderboardNew: React.FC<Props> = ({ provider }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { verifier } = await getContracts(provider);
      const count: bigint = await verifier.getActionCount();
      const limit = Number(count > 100n ? 100n : count);
      const start = Number(count) - limit;

      const map = new Map<string, bigint>();
      const now = Date.now() / 1000; // Current timestamp in seconds
      const timeframeSeconds = timeframe === 'week' ? 604800 : timeframe === 'month' ? 2592000 : Infinity;

      for (let i = start; i < Number(count); i++) {
        const act = await verifier.actions(i);
        // act shape: [user, description,(proofCid,) reward, verified, timestamp]
        const user = act.user as string;
        const reward = BigInt(act.reward ?? 0n);
        const verified = Boolean(act.verified);
        const timestamp = Number(act.timestamp || 0);

        // Filter by timeframe if not 'all'
        if (timeframe !== 'all' && (now - timestamp) > timeframeSeconds) {
          continue;
        }

        if (verified) map.set(user, (map.get(user) ?? 0n) + reward);
      }

      const items = Array.from(map.entries()).map(([user, total]) => ({ user, total }));
      items.sort((a, b) => (a.total > b.total ? -1 : 1));
      setRows(items.slice(0, 10));
    })().catch(console.error).finally(() => setLoading(false));
  }, [provider, timeframe]);

  const format = (x: bigint) => (Number(x) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 4 });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500';
      case 1: return 'bg-gray-400';
      case 2: return 'bg-amber-600';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="container-responsive">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-400">Top environmental contributors earning Green Credit Tokens</p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex-center">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: 'week', label: 'This Week' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeframe === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🌟 Top Contributors</h2>
            <p className="card-description">
              {timeframe === 'all' ? 'All-time' : timeframe === 'month' ? 'Monthly' : 'Weekly'} verified environmental actions
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="loading-skeleton w-10 h-10 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="loading-skeleton h-4 w-24"></div>
                      <div className="loading-skeleton h-3 w-32"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="loading-skeleton h-5 w-16"></div>
                    <div className="loading-skeleton h-3 w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No verified actions yet</h3>
              <p className="text-gray-600 mb-6">Be the first to contribute and earn Green Credit Tokens!</p>
              <button className="btn btn-primary">Start Contributing</button>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r, index) => (
                <div key={r.user} className="flex-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className={`flex-center w-12 h-12 rounded-full font-bold text-white text-lg ${getRankColor(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 font-mono">
                        {r.user.slice(0, 6)}...{r.user.slice(-4)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="status-chip status-verified">Verified</span>
                        Contributor
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">{format(r.total)} GCT</div>
                    <div className="text-sm text-gray-500">Earned tokens</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!loading && rows.length > 0 && (
          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Join the Leaders?</h3>
              <p className="text-gray-600 mb-6">Submit your environmental actions and earn Green Credit Tokens</p>
              <button className="btn btn-primary btn-lg">Submit Your Action</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardNew;
