import React, { useState, useEffect } from "react";
import { BrowserProvider, formatUnits } from "ethers";
import toast from "react-hot-toast";
import { getContracts, USE_V2 } from "../utils/contract";

interface RetirementProps {
  provider: BrowserProvider;
  address: string;
}

interface Action {
  id: number;
  user: string;
  description: string;
  quantity: string;
  status: number;
  selected: boolean;
  gramsToRetire: string;
}

const Retirement: React.FC<RetirementProps> = ({ provider, address }) => {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [reason, setReason] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [lastSerial, setLastSerial] = useState("");
  const [myRetirements, setMyRetirements] = useState<any[]>([]);

  useEffect(() => {
    loadActions();
    loadMyRetirements();
  }, [provider, address]);

  const loadActions = async () => {
    try {
      const { verifier } = await getContracts(provider, false);
      const count = await verifier.getActionCount();
      const loadedActions: Action[] = [];

      for (let i = 0; i < Number(count); i++) {
        const action = await verifier.actions(i);
        
        // Only show finalized actions for the current user
        if (USE_V2) {
          if (action.user.toLowerCase() === address.toLowerCase() && action.status === 2) { // Finalized
            loadedActions.push({
              id: i,
              user: action.user,
              description: action.description,
              quantity: action.quantity.toString(),
              status: action.status,
              selected: false,
              gramsToRetire: action.quantity.toString()
            });
          }
        } else {
          // Legacy - assume all verified actions can be retired
          if (action.user.toLowerCase() === address.toLowerCase() && action.verified) {
            loadedActions.push({
              id: i,
              user: action.user,
              description: action.description,
              quantity: "0", // Legacy doesn't track quantity
              status: 2,
              selected: false,
              gramsToRetire: "1000000" // Default 1000 kg
            });
          }
        }
      }

      setActions(loadedActions);
    } catch (err) {
      console.error("Error loading actions:", err);
    }
  };

  const loadMyRetirements = async () => {
    try {
      const { retirementRegistry } = await getContracts(provider, false);
      if (!retirementRegistry) return;

      const serials = await retirementRegistry.getRetirementsByAccount(address);
      const retirements = [];

      for (const serial of serials) {
        const retirement = await retirementRegistry.getRetirement(serial);
        retirements.push({
          serial: retirement.serial.toString(),
          actionIds: retirement.actionIds.map((id: any) => id.toString()),
          grams: retirement.grams.map((g: any) => g.toString()),
          reason: retirement.reason,
          beneficiary: retirement.beneficiary,
          timestamp: new Date(Number(retirement.timestamp) * 1000).toLocaleString()
        });
      }

      setMyRetirements(retirements);
    } catch (err) {
      console.error("Error loading retirements:", err);
    }
  };

  const toggleAction = (id: number) => {
    setActions(actions.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const updateGrams = (id: number, grams: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, gramsToRetire: grams } : a));
  };

  const handleRetire = async () => {
    const selected = actions.filter(a => a.selected);
    
    if (selected.length === 0) {
      toast.error("Please select at least one action to retire");
      return;
    }

    if (!reason || !beneficiary) {
      toast.error("Please provide reason and beneficiary");
      return;
    }

    setLoading(true);
    try {
      const { retirementRegistryWithSigner } = await getContracts(provider, true);
      if (!retirementRegistryWithSigner) {
        toast.error("RetirementRegistry contract not configured");
        return;
      }

      const actionIds = selected.map(a => a.id);
      const grams = selected.map(a => BigInt(a.gramsToRetire || "0"));

      // Validate grams
      for (let i = 0; i < grams.length; i++) {
        if (grams[i] <= 0n) {
          toast.error(`Invalid grams for action ${actionIds[i]}`);
          return;
        }
      }

      toast.loading("Retiring credits...", { id: "retire" });
      const tx = await retirementRegistryWithSigner.retire(actionIds, grams, reason, beneficiary);
      const receipt = await tx.wait();

      // Parse the Retired event to get the serial
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = retirementRegistryWithSigner.interface.parseLog(log);
          return parsed && parsed.name === "Retired";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = retirementRegistryWithSigner.interface.parseLog(event);
        const serial = parsed?.args?.serial?.toString() || "Unknown";
        setLastSerial(serial);
        toast.success(`Credits retired! Serial: ${serial}`, { id: "retire" });
      } else {
        toast.success("Credits retired successfully!", { id: "retire" });
      }

      // Reset form
      setReason("");
      setBeneficiary("");
      await loadActions();
      await loadMyRetirements();
    } catch (err: any) {
      console.error("Retire error:", err);
      toast.error(err?.reason || err?.message || "Failed to retire credits");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalGrams = () => {
    return actions
      .filter(a => a.selected)
      .reduce((sum, a) => sum + BigInt(a.gramsToRetire || "0"), 0n);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">🏆 Retire Credits</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Retirement Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Actions List */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Select Actions to Retire</h2>
            
            {actions.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No finalized actions available to retire.</p>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      action.selected
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                    }`}
                    onClick={() => toggleAction(action.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={action.selected}
                            onChange={() => toggleAction(action.id)}
                            className="h-5 w-5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <h3 className="font-semibold">Action #{action.id}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                        {USE_V2 && action.quantity !== "0" && (
                          <p className="text-sm text-gray-500 mt-1">
                            Total quantity: {(Number(action.quantity) / 1000).toFixed(2)} kg CO2e
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {action.selected && (
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-sm font-medium mb-1">Grams CO2e to Retire</label>
                        <input
                          type="number"
                          min="1"
                          value={action.gramsToRetire}
                          onChange={(e) => updateGrams(action.id, e.target.value)}
                          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          placeholder="Enter grams"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          = {(Number(action.gramsToRetire || 0) / 1000).toFixed(2)} kg
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retirement Details */}
          {actions.some(a => a.selected) && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Retirement Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Retirement</label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Carbon offset for company operations 2024"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Beneficiary</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corp"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="font-semibold mb-1">Total to Retire:</p>
                  <p className="text-2xl text-[var(--primary-green)]">
                    {(Number(calculateTotalGrams()) / 1000).toFixed(2)} kg CO2e
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ({calculateTotalGrams().toString()} grams)
                  </p>
                </div>

                <button
                  onClick={handleRetire}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Processing..." : "🏆 Retire Credits"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Last Serial */}
          {lastSerial && (
            <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-2">✅ Last Retirement</h3>
              <p className="text-sm">Serial: <span className="font-mono text-green-600 dark:text-green-400">{lastSerial}</span></p>
            </div>
          )}

          {/* My Retirements */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">📜 My Retirements</h3>
            {myRetirements.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No retirements yet.</p>
            ) : (
              <div className="space-y-3">
                {myRetirements.map((ret) => (
                  <div key={ret.serial} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold text-sm">Serial: {ret.serial}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Actions: {ret.actionIds.join(", ")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total: {ret.grams.reduce((sum: number, g: string) => sum + Number(g), 0) / 1000} kg
                    </p>
                    <p className="text-xs text-gray-500">{ret.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">💡 About Retirement</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
              <li>Retirement permanently removes credits from circulation</li>
              <li>Each retirement receives a unique serial number</li>
              <li>Specify beneficiary for proper attribution</li>
              <li>Retirements are recorded immutably on-chain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Retirement;
