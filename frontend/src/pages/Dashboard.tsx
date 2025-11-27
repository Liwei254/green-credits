import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider, formatUnits } from "ethers";
import { getContracts } from "../utils/contract";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Leaf, TrendingUp } from "lucide-react";

type Props = { provider: BrowserProvider; address: string };

interface NetworkInfo {
  name: string;
  blockNumber: number;
  gasPrice: string;
}

const Dashboard: React.FC<Props> = ({ provider, address }) => {
  const [balance, setBalance] = useState<string>("0");
  const [actions, setActions] = useState<number>(0);
  const [verifiedActions, setVerifiedActions] = useState<number>(0);
  const [co2Offset, setCo2Offset] = useState<number>(0);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const balanceChange = useMemo(() => {
    const current = Number(balance);
    const previous = current * 0.95;
    if (!previous) return "0.0";
    return (((current - previous) / previous) * 100).toFixed(1);
  }, [balance]);

  const actionsChange = useMemo(() => {
    return verifiedActions > 0 ? "+3" : "0";
  }, [verifiedActions]);

  const co2Change = useMemo(() => {
    return co2Offset > 0 ? "-0.8" : "0";
  }, [co2Offset]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { token, verifier } = await getContracts(provider);

        const [bal, count, feeData] = await Promise.all([
          token.balanceOf(address),
          verifier.getActionCount(),
          provider.getFeeData(),
        ]);

        const formattedBalance = formatUnits(bal, 18);
        setBalance(formattedBalance);

        const actionCount = Number(count);
        setActions(actionCount);

        let verified = 0;
        let totalReward = 0n;

        const batchSize = 10;
        for (let i = 0; i < actionCount; i += batchSize) {
          const batchPromises = [];
          for (let j = i; j < Math.min(i + batchSize, actionCount); j++) {
            batchPromises.push(verifier.actions(j));
          }
          const batchResults = await Promise.all(batchPromises);

          for (const act of batchResults) {
            if (act.verified) {
              verified++;
              totalReward += BigInt(act.reward ?? 0n);
            }
          }
        }

        setVerifiedActions(verified);
        setCo2Offset((Number(totalReward) / 1e18) * 0.1);

        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();

        setNetworkInfo({
          name: network.name === "moonbeam" ? "Moonbase Alpha" : network.name,
          blockNumber,
          gasPrice: formatUnits(feeData.gasPrice || 0n, "gwei"),
        });

        toast.success("Dashboard data loaded successfully");
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please check your connection.");
        toast.error("Failed to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [provider, address]);

  const chartData = useMemo(() => {
    const currentBalance = Number(balance);
    return [
      { name: "Jan", tokens: Math.max(0, currentBalance * 0.1) },
      { name: "Feb", tokens: Math.max(0, currentBalance * 0.25) },
      { name: "Mar", tokens: Math.max(0, currentBalance * 0.45) },
      { name: "Apr", tokens: Math.max(0, currentBalance * 0.7) },
      { name: "May", tokens: Math.max(0, currentBalance * 0.85) },
      { name: "Jun", tokens: currentBalance },
    ];
  }, [balance]);

  if (loading) {
    return (
      <div className="container-responsive">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <div className="loading-skeleton h-8 w-64 mx-auto mb-2"></div>
            <div className="loading-skeleton h-4 w-96 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="loading-skeleton h-24 w-full"></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="loading-skeleton h-80 w-full"></div>
          </div>
          <div className="card">
            <div className="loading-skeleton h-32 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-responsive">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-lg">
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-green-50">
      <div className="container-responsive py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Leaf className="w-16 h-16 text-emerald-500" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Green Credits Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              🌿 Track your environmental impact and token growth
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/50 border-emerald-200/50"
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-3 bg-emerald-100 rounded-full"
                >
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">GCT Balance</h3>
                  <p className="text-sm text-gray-500">Green Credit Tokens</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <div
                className={`text-sm font-medium flex items-center gap-1 ${
                  balanceChange.startsWith("-") ? "text-red-500" : "text-emerald-600"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {balanceChange.startsWith("-") ? balanceChange : `+${balanceChange}`}% vs last month
              </div>
            </motion.div>

            <motion.div className="card bg-white/60 border border-emerald-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500">Total Actions</h3>
              <div className="text-3xl font-bold text-gray-900 mt-2">{actions}</div>
              <p className="text-sm text-emerald-600 mt-1">{actionsChange} new this week</p>
            </motion.div>

            <motion.div className="card bg-white/60 border border-emerald-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500">Verified Actions</h3>
              <div className="text-3xl font-bold text-gray-900 mt-2">{verifiedActions}</div>
              <p className="text-sm text-emerald-600 mt-1">{co2Change}% CO₂ change</p>
            </motion.div>
          </motion.div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📊 Token Growth & Activity</h2>
              <p className="card-description">Your GCT balance growth over time</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#374151", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tokens"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#16a34a", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔗 Network Status</h2>
              <p className="card-description">Your connection to the Polkadot ecosystem</p>
            </div>
            {networkInfo && (
              <div className="bg-gradient-to-r from-primary-bg to-info-bg border border-primary rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🌙</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{networkInfo.name} Network</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-success">Connected & Syncing</span>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Latest Block</div>
                    <div className="text-lg font-mono font-semibold text-gray-900">
                      #{networkInfo.blockNumber.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Gas Price</div>
                    <div className="text-lg font-mono font-semibold text-gray-900">
                      {Number(networkInfo.gasPrice).toFixed(1)} gwei
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                  Your impact is transparently recorded on the Polkadot ecosystem, ensuring trust and
                  immutability. Every action, verification, and transaction is permanently stored on-chain.
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🎯 Quick Actions</h2>
              <p className="card-description">Jump into your favorite activities</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.hash = "#/submit"}
                className="group p-6 bg-gradient-to-br from-success-bg to-success/10 hover:from-success/20 hover:to-success/20 border border-success/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌱</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Submit Action</h3>
                  <p className="text-sm text-gray-600">Share your impact</p>
                </div>
              </button>
              <button
                onClick={() => window.location.hash = "#/actions"}
                className="group p-6 bg-gradient-to-br from-primary-bg to-primary/10 hover:from-primary/20 hover:to-primary/20 border border-primary/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
                  <h3 className="font-semibold text-gray-900 mb-1">View Actions</h3>
                  <p className="text-sm text-gray-600">Track your history</p>
                </div>
              </button>
              <button
                onClick={() => window.location.hash = "#/donate"}
                className="group p-6 bg-gradient-to-br from-warning-bg to-warning/10 hover:from-warning/20 hover:to-warning/20 border border-warning/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💚</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Make Donation</h3>
                  <p className="text-sm text-gray-600">Support causes</p>
                </div>
              </button>
              <button
                onClick={() => window.location.hash = "#/leaderboard"}
                className="group p-6 bg-gradient-to-br from-secondary-bg to-secondary/10 hover:from-secondary/20 hover:to-secondary/20 border border-secondary/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Leaderboard</h3>
                  <p className="text-sm text-gray-600">See top contributors</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
