import React, { useState, useEffect } from "react";
import { BrowserProvider, parseUnits, formatUnits, encodeBytes32String } from "ethers";
import toast from "react-hot-toast";
import { getContracts } from "../utils/contract";

interface MatchingPoolProps {
  provider: BrowserProvider;
}

const MatchingPoolNew: React.FC<MatchingPoolProps> = ({ provider }) => {
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
    <div className="container-responsive">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Quadratic Matching Pool</h1>
          <p className="text-gray-600 text-lg">Amplify impact through quadratic funding</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Section - Donate */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🎁 Make a Donation</h2>
              <p className="card-description">Support environmental projects and get matching funds</p>
            </div>

            <div className="space-y-6">
              <div className="bg-success-bg border border-success rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-success text-lg">💰</div>
                  <div className="text-sm font-semibold text-success">Your Balance</div>
                </div>
                <div className="text-2xl font-bold text-success">{parseFloat(balance).toFixed(2)} GCT</div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Round ID</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={donateRoundId}
                    onChange={(e) => setDonateRoundId(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Amount (GCT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Project ID</label>
                <input
                  type="text"
                  placeholder="e.g., reforestation_2024"
                  value={donateProjectId}
                  onChange={(e) => setDonateProjectId(e.target.value)}
                  className="input"
                />
              </div>

              <button
                onClick={handleDonate}
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? "🌿 Processing..." : "🚀 Donate & Get Matched"}
              </button>
            </div>
          </div>

          {/* View Round Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📊 Round Information</h2>
              <p className="card-description">Check current round status and details</p>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label className="label">Round ID</label>
                <input
                  type="number"
                  placeholder="1"
                  value={roundId}
                  onChange={(e) => setRoundId(e.target.value)}
                  className="input"
                />
              </div>

              {currentRound ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${currentRound.active ? 'bg-success' : 'bg-error'}`}></div>
                    <span className={`text-lg font-semibold ${currentRound.active ? 'text-success' : 'text-error'}`}>
                      {currentRound.active ? 'Active Round' : 'Inactive Round'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Start Date</div>
                      <div className="font-medium">{currentRound.start}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">End Date</div>
                      <div className="font-medium">{currentRound.end}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-gray-600 mb-1">Matching Budget</div>
                      <div className="text-2xl font-bold text-success">{currentRound.matchingBudget} GCT</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🔍</div>
                  <p>No round found with ID {roundId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Section */}
        {isOwner && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Admin Controls</h2>
              <p className="text-gray-600">Manage quadratic funding rounds</p>
            </div>

            {/* Create Round */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Create New Round</h3>
                <p className="card-description">Set up a new quadratic funding round</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="form-group">
                  <label className="label">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Matching Budget (GCT)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    value={matchingBudget}
                    onChange={(e) => setMatchingBudget(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateRound}
                disabled={loading}
                className="btn btn-primary btn-lg w-full mt-6"
              >
                {loading ? "🌿 Creating..." : "🚀 Create Round"}
              </button>
            </div>

            {/* Manage Round */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Round Management</h3>
                <p className="card-description">Activate or deactivate funding rounds</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleActivateRound}
                  disabled={loading}
                  className="btn btn-success flex-1"
                >
                  {loading ? "Processing..." : "▶️ Activate Round"}
                </button>
                <button
                  onClick={handleDeactivateRound}
                  disabled={loading}
                  className="btn btn-secondary flex-1"
                >
                  {loading ? "Processing..." : "⏸️ Deactivate Round"}
                </button>
              </div>
            </div>

            {/* Add Project */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add Project to Round</h3>
                <p className="card-description">Register environmental projects for funding</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label">Project ID</label>
                  <input
                    type="text"
                    placeholder="e.g., reforestation_2024"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Project Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={projectAddress}
                    onChange={(e) => setProjectAddress(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <button
                onClick={handleAddProject}
                disabled={loading}
                className="btn btn-primary w-full mt-6"
              >
                {loading ? "🌿 Adding..." : "➕ Add Project"}
              </button>
            </div>

            {/* Finalize Round */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Finalize Round & Disburse Matches</h3>
                <p className="card-description">Calculate quadratic matches and distribute funds</p>
              </div>

              <div className="space-y-6">
                <div className="form-group">
                  <label className="label">Round ID to Finalize</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={finalizeRoundId}
                    onChange={(e) => setFinalizeRoundId(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="label">Project IDs (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="project1,project2,project3"
                      value={projectIds}
                      onChange={(e) => setProjectIds(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Match Amounts in GCT (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="300,400,300"
                      value={matchAmounts}
                      onChange={(e) => setMatchAmounts(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? "🌿 Finalizing..." : "🏁 Finalize & Disburse"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="card bg-gradient-to-r from-primary-bg to-info-bg border-primary">
          <div className="card-header">
            <h3 className="card-title">💡 How Quadratic Funding Works</h3>
            <p className="card-description">Understanding the power of collective funding</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Quadratic Matching</h4>
                  <p className="text-sm text-gray-600">More small donations = larger matching allocation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">⚖️</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fair Distribution</h4>
                  <p className="text-sm text-gray-600">Admin calculates quadratic formula off-chain and submits allocations</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">⏰</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Round Lifecycle</h4>
                  <p className="text-sm text-gray-600">Rounds must be ended before finalization</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">💰</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Full Distribution</h4>
                  <p className="text-sm text-gray-600">Both direct donations and matches are distributed to projects upon finalization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingPoolNew;
