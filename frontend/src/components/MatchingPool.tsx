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
  export { default } from "../pages/MatchingPool";
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
