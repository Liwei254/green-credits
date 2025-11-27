import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";
import { getContracts } from "../../utils/contract";

interface AdminReputationProps {
  provider: BrowserProvider;
}

const AdminReputation: React.FC<AdminReputationProps> = ({ provider }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Mint form
  const [mintAddress, setMintAddress] = useState("");
  const [mintTokenId, setMintTokenId] = useState("");
  const [mintLevel, setMintLevel] = useState("3");
  
  // Revoke form
  const [revokeTokenId, setRevokeTokenId] = useState("");
  
  // Reputation form
  const [repAddress, setRepAddress] = useState("");
  const [repAmount, setRepAmount] = useState("");
  const [repOperation, setRepOperation] = useState<"increase" | "decrease">("increase");
  
  // Badge list
  const [badges, setBadges] = useState<Array<{ address: string; tokenId: string; level: number; reputation: number }>>([]);

  useEffect(() => {
    checkOwnership();
  }, [provider]);

  const checkOwnership = async () => {
    try {
      const { verifierBadgeSBT } = await getContracts(provider, false);
      if (!verifierBadgeSBT) return;
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const owner = await verifierBadgeSBT.owner();
      setIsOwner(address.toLowerCase() === owner.toLowerCase());
    } catch (err) {
      console.error("Error checking ownership:", err);
    }
  };

  const handleMintBadge = async () => {
    if (!mintAddress || !mintTokenId || !mintLevel) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { verifierBadgeSBTWithSigner } = await getContracts(provider, true);
      if (!verifierBadgeSBTWithSigner) {
        toast.error("VerifierBadgeSBT contract not configured");
        return;
      }

      const tx = await verifierBadgeSBTWithSigner.mint(mintAddress, mintTokenId, parseInt(mintLevel));
      toast.loading("Minting badge...", { id: "mint" });
      await tx.wait();
      toast.success("Badge minted successfully!", { id: "mint" });
      
      setMintAddress("");
      setMintTokenId("");
      setMintLevel("3");
      await loadBadges();
    } catch (err: any) {
      console.error("Mint error:", err);
      toast.error(err?.reason || err?.message || "Failed to mint badge");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeBadge = async () => {
    if (!revokeTokenId) {
      toast.error("Token ID is required");
      return;
    }

    setLoading(true);
    try {
      const { verifierBadgeSBTWithSigner } = await getContracts(provider, true);
      if (!verifierBadgeSBTWithSigner) {
        toast.error("VerifierBadgeSBT contract not configured");
        return;
      }

      const tx = await verifierBadgeSBTWithSigner.revoke(revokeTokenId);
      toast.loading("Revoking badge...", { id: "revoke" });
      await tx.wait();
      toast.success("Badge revoked successfully!", { id: "revoke" });
      
      setRevokeTokenId("");
      await loadBadges();
    } catch (err: any) {
      console.error("Revoke error:", err);
      toast.error(err?.reason || err?.message || "Failed to revoke badge");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustReputation = async () => {
    if (!repAddress || !repAmount) {
      toast.error("Address and amount are required");
      return;
    }

    setLoading(true);
    try {
      const { verifierBadgeSBTWithSigner } = await getContracts(provider, true);
      if (!verifierBadgeSBTWithSigner) {
        toast.error("VerifierBadgeSBT contract not configured");
        return;
      }

      const amount = parseInt(repAmount);
      if (amount <= 0) {
        toast.error("Amount must be positive");
        return;
      }

      const tx = repOperation === "increase"
        ? await verifierBadgeSBTWithSigner.increaseReputation(repAddress, amount)
        : await verifierBadgeSBTWithSigner.decreaseReputation(repAddress, amount);
      
      toast.loading(`${repOperation === "increase" ? "Increasing" : "Decreasing"} reputation...`, { id: "rep" });
      await tx.wait();
      toast.success(`Reputation ${repOperation === "increase" ? "increased" : "decreased"} successfully!`, { id: "rep" });
      
      setRepAddress("");
      setRepAmount("");
      await loadBadges();
    } catch (err: any) {
      console.error("Reputation error:", err);
      toast.error(err?.reason || err?.message || "Failed to adjust reputation");
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
    try {
      const { verifierBadgeSBT, verifier } = await getContracts(provider, false);
      if (!verifierBadgeSBT || !verifier) return;

      // Note: This is a simplified approach. In production, you'd want to:
      // 1. Listen to BadgeMinted events to track all badges
      // 2. Use a subgraph or indexer for efficient querying
      // For now, we'll just show a message to add addresses manually
      
      setBadges([]);
    } catch (err) {
      console.error("Error loading badges:", err);
    }
  };

  const checkBadgeAndReputation = async () => {
    if (!repAddress) {
      toast.error("Enter an address to check");
      return;
    }

    try {
      const { verifierBadgeSBT } = await getContracts(provider, false);
      if (!verifierBadgeSBT) {
        toast.error("VerifierBadgeSBT contract not configured");
        return;
      }

      const tokenId = await verifierBadgeSBT.tokenOfOwner(repAddress);
      const reputation = await verifierBadgeSBT.reputationOf(repAddress);

      if (tokenId === 0n) {
        toast.error("Address has no badge");
      } else {
        const level = await verifierBadgeSBT.levelOf(tokenId);
        toast.success(`Badge: Level ${level}, Reputation: ${reputation.toString()}`);
      }
    } catch (err: any) {
      console.error("Check error:", err);
      toast.error(err?.message || "Failed to check badge");
    }
  };

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Only the contract owner can manage verifier badges and reputation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">👤 Verifier Reputation Management</h1>

      {/* Mint Badge Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">🏅 Mint Verifier Badge</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Verifier Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Token ID</label>
            <input
              type="number"
              placeholder="1"
              value={mintTokenId}
              onChange={(e) => setMintTokenId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Badge Level (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={mintLevel}
              onChange={(e) => setMintLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={handleMintBadge}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Processing..." : "Mint Badge"}
          </button>
        </div>
      </div>

      {/* Revoke Badge Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">🚫 Revoke Badge</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Token ID</label>
            <input
              type="number"
              placeholder="Token ID to revoke"
              value={revokeTokenId}
              onChange={(e) => setRevokeTokenId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={handleRevokeBadge}
            disabled={loading}
            className="btn-secondary w-full"
          >
            {loading ? "Processing..." : "Revoke Badge"}
          </button>
        </div>
      </div>

      {/* Adjust Reputation Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">⭐ Adjust Reputation</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Verifier Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={repAddress}
              onChange={(e) => setRepAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amount (positive integer)</label>
            <input
              type="number"
              min="1"
              placeholder="100"
              value={repAmount}
              onChange={(e) => setRepAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setRepOperation("increase");
                handleAdjustReputation();
              }}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Processing..." : "➕ Increase"}
            </button>
            <button
              onClick={() => {
                setRepOperation("decrease");
                handleAdjustReputation();
              }}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              {loading ? "Processing..." : "➖ Decrease"}
            </button>
          </div>
        </div>
      </div>

      {/* Check Badge/Reputation Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">🔍 Check Badge & Reputation</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Verifier Address</label>
            <input
              type="text"
              placeholder="0x... (can reuse address from above)"
              value={repAddress}
              onChange={(e) => setRepAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <button
            onClick={checkBadgeAndReputation}
            className="btn-secondary w-full"
          >
            Check Status
          </button>
        </div>
      </div>

      <div className="card mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">💡 Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Badges are soulbound (non-transferable) NFTs</li>
          <li>Each address can only have one badge</li>
          <li>Reputation scores can be positive or negative</li>
          <li>Reputation adjustments are logged on-chain for transparency</li>
          <li>Token IDs must be unique across all badges</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminReputation;
