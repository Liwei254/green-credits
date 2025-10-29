import React, { useState, useEffect } from "react";
import { BrowserProvider, parseUnits, formatUnits, encodeBytes32String } from "ethers";
import toast from "react-hot-toast";
import { getContracts } from "../utils/contract";

interface MatchingPoolProps {
  provider: BrowserProvider;
}

const MatchingPool: React.FC<MatchingPoolProps> = ({ provider }) => {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  
  // Round creation form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [matchingBudget, setMatchingBudget] = useState("");
  
  // Round management
  const [roundId, setRoundId] = useState("1");
  const [currentRound, setCurrentRound] = useState<any>(null);
  
  // Project management
  const [projectId, setProjectId] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  
  // Donation
  const [donateRoundId, setDonateRoundId] = useState("1");
  const [donateProjectId, setDonateProjectId] = useState("");
  const [donateAmount, setDonateAmount] = useState("");
  
  // Finalization
  const [finalizeRoundId, setFinalizeRoundId] = useState("1");
  const [projectIds, setProjectIds] = useState("");
  const [matchAmounts, setMatchAmounts] = useState("");

  useEffect(() => {
    checkOwnership();
    loadBalance();
  }, [provider]);

  useEffect(() => {
    if (roundId) {
      loadRound();
    }
  }, [roundId]);

  const checkOwnership = async () => {
    try {
      const { matchingPool } = await getContracts(provider, false);
      if (!matchingPool) return;
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const owner = await matchingPool.owner();
      setIsOwner(address.toLowerCase() === owner.toLowerCase());
    } catch (err) {
      console.error("Error checking ownership:", err);
    }
  };

  const loadBalance = async () => {
    try {
      const { token } = await getContracts(provider, false);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const bal = await token.balanceOf(address);
      setBalance(formatUnits(bal, 18));
    } catch (err) {
      console.error("Error loading balance:", err);
    }
  };

  const loadRound = async () => {
    try {
      const { matchingPool } = await getContracts(provider, false);
      if (!matchingPool || !roundId) return;
      
      const round = await matchingPool.getRound(roundId);
      setCurrentRound({
        id: round.id.toString(),
        token: round.token,
        start: new Date(Number(round.start) * 1000).toLocaleString(),
        end: new Date(Number(round.end) * 1000).toLocaleString(),
        matchingBudget: formatUnits(round.matchingBudget, 18),
        active: round.active
      });
    } catch (err) {
      console.error("Error loading round:", err);
      setCurrentRound(null);
    }
  };

  const handleCreateRound = async () => {
    if (!startDate || !endDate || !matchingBudget) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner, token } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      const start = Math.floor(new Date(startDate).getTime() / 1000);
      const end = Math.floor(new Date(endDate).getTime() / 1000);
      const budget = parseUnits(matchingBudget, 18);

      const tx = await matchingPoolWithSigner.createRound(token.target, start, end, budget);
      toast.loading("Creating round...", { id: "create" });
      const receipt = await tx.wait();
      
      // Get the round ID from event (simplified - in production parse events properly)
      toast.success("Round created successfully!", { id: "create" });
      
      setStartDate("");
      setEndDate("");
      setMatchingBudget("");
    } catch (err: any) {
      console.error("Create round error:", err);
      toast.error(err?.reason || err?.message || "Failed to create round");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRound = async () => {
    if (!roundId) {
      toast.error("Round ID is required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      const tx = await matchingPoolWithSigner.activateRound(roundId);
      toast.loading("Activating round...", { id: "activate" });
      await tx.wait();
      toast.success("Round activated!", { id: "activate" });
      await loadRound();
    } catch (err: any) {
      console.error("Activate error:", err);
      toast.error(err?.reason || err?.message || "Failed to activate round");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateRound = async () => {
    if (!roundId) {
      toast.error("Round ID is required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      const tx = await matchingPoolWithSigner.deactivateRound(roundId);
      toast.loading("Deactivating round...", { id: "deactivate" });
      await tx.wait();
      toast.success("Round deactivated!", { id: "deactivate" });
      await loadRound();
    } catch (err: any) {
      console.error("Deactivate error:", err);
      toast.error(err?.reason || err?.message || "Failed to deactivate round");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!roundId || !projectId || !projectAddress) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      const projectIdBytes = encodeBytes32String(projectId);
      const tx = await matchingPoolWithSigner.addProject(roundId, projectIdBytes, projectAddress);
      toast.loading("Adding project...", { id: "addProject" });
      await tx.wait();
      toast.success("Project added to round!", { id: "addProject" });
      
      setProjectId("");
      setProjectAddress("");
    } catch (err: any) {
      console.error("Add project error:", err);
      toast.error(err?.reason || err?.message || "Failed to add project");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donateRoundId || !donateProjectId || !donateAmount) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner, tokenWithSigner } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      const amount = parseUnits(donateAmount, 18);
      const projectIdBytes = encodeBytes32String(donateProjectId);

      // Approve first
      toast.loading("Approving tokens...", { id: "donate" });
      const approveTx = await tokenWithSigner.approve(matchingPoolWithSigner.target, amount);
      await approveTx.wait();

      // Then donate
      toast.loading("Donating...", { id: "donate" });
      const tx = await matchingPoolWithSigner.donate(donateRoundId, projectIdBytes, amount);
      await tx.wait();
      toast.success("Donation successful!", { id: "donate" });
      
      setDonateAmount("");
      await loadBalance();
    } catch (err: any) {
      console.error("Donate error:", err);
      toast.error(err?.reason || err?.message || "Failed to donate");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!finalizeRoundId || !projectIds || !matchAmounts) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { matchingPoolWithSigner } = await getContracts(provider, true);
      if (!matchingPoolWithSigner) {
        toast.error("MatchingPool contract not configured");
        return;
      }

      // Parse comma-separated inputs
      const projectIdsArray = projectIds.split(",").map(id => encodeBytes32String(id.trim()));
      const amountsArray = matchAmounts.split(",").map(amt => parseUnits(amt.trim(), 18));

      if (projectIdsArray.length !== amountsArray.length) {
        toast.error("Project IDs and amounts must have the same length");
        return;
      }

      const tx = await matchingPoolWithSigner.setMatchAllocations(finalizeRoundId, projectIdsArray, amountsArray);
      toast.loading("Finalizing round and disbursing matches...", { id: "finalize" });
      await tx.wait();
      toast.success("Round finalized and matches disbursed!", { id: "finalize" });
      
      setProjectIds("");
      setMatchAmounts("");
    } catch (err: any) {
      console.error("Finalize error:", err);
      toast.error(err?.reason || err?.message || "Failed to finalize round");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-green)]">💰 Quadratic Matching Pool</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* User Section - Donate */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🎁 Make a Donation</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your Balance: {parseFloat(balance).toFixed(2)} GCT
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Round ID</label>
              <input
                type="number"
                placeholder="1"
                value={donateRoundId}
                onChange={(e) => setDonateRoundId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Project ID</label>
              <input
                type="text"
                placeholder="e.g., reforestation_2024"
                value={donateProjectId}
                onChange={(e) => setDonateProjectId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (GCT)</label>
              <input
                type="number"
                step="0.01"
                placeholder="100"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <button
              onClick={handleDonate}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Processing..." : "Donate"}
            </button>
          </div>
        </div>

        {/* View Round Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📊 Round Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Round ID</label>
              <input
                type="number"
                placeholder="1"
                value={roundId}
                onChange={(e) => setRoundId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            {currentRound && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Status:</strong> {currentRound.active ? "🟢 Active" : "🔴 Inactive"}</p>
                <p><strong>Start:</strong> {currentRound.start}</p>
                <p><strong>End:</strong> {currentRound.end}</p>
                <p><strong>Matching Budget:</strong> {currentRound.matchingBudget} GCT</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {isOwner && (
        <div className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--primary-green)]">⚙️ Admin Controls</h2>
          
          {/* Create Round */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Create New Round</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Matching Budget (GCT)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  value={matchingBudget}
                  onChange={(e) => setMatchingBudget(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <button
              onClick={handleCreateRound}
              disabled={loading}
              className="btn-primary w-full mt-4"
            >
              {loading ? "Processing..." : "Create Round"}
            </button>
          </div>

          {/* Manage Round */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Manage Round</h3>
            <div className="flex gap-4">
              <button
                onClick={handleActivateRound}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "Processing..." : "Activate Round"}
              </button>
              <button
                onClick={handleDeactivateRound}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                {loading ? "Processing..." : "Deactivate Round"}
              </button>
            </div>
          </div>

          {/* Add Project */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Add Project to Round</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project ID</label>
                <input
                  type="text"
                  placeholder="e.g., reforestation_2024"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Project Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <button
                onClick={handleAddProject}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Processing..." : "Add Project"}
              </button>
            </div>
          </div>

          {/* Finalize Round */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Finalize Round & Disburse Matches</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Round ID to Finalize</label>
                <input
                  type="number"
                  placeholder="1"
                  value={finalizeRoundId}
                  onChange={(e) => setFinalizeRoundId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Project IDs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="project1,project2,project3"
                  value={projectIds}
                  onChange={(e) => setProjectIds(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Match Amounts in GCT (comma-separated)</label>
                <input
                  type="text"
                  placeholder="300,400,300"
                  value={matchAmounts}
                  onChange={(e) => setMatchAmounts(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Processing..." : "Finalize & Disburse"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">💡 How Quadratic Funding Works</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>More small donations = larger matching allocation</li>
          <li>Admin calculates quadratic formula off-chain and submits allocations</li>
          <li>Rounds must be ended before finalization</li>
          <li>Both direct donations and matches are distributed to projects upon finalization</li>
        </ul>
      </div>
    </div>
  );
};

export default MatchingPool;
