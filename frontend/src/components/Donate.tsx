import React, { useState } from "react";
import { BrowserProvider, parseUnits, formatEther } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const Donate: React.FC<Props> = ({ provider }) => {
  const [ngo, setNgo] = useState("");
  const [amount, setAmount] = useState("5");
  const [busy, setBusy] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [estimatedGasApprove, setEstimatedGasApprove] = useState<string>("");
  const [estimatedGasDonate, setEstimatedGasDonate] = useState<string>("");
  const [gasPrice, setGasPrice] = useState<string>("");

  // Mock NGO data - in future, fetch from contract or API
  const ngoList = [
    { address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", name: "Green Earth Foundation", totalReceived: "1250.5" },
    { address: "0x8ba1f109551bD432803012645ac136ddd64DBA72", name: "Ocean Cleanup Initiative", totalReceived: "890.2" },
    { address: "0x1234567890123456789012345678901234567890", name: "Forest Restoration Alliance", totalReceived: "2100.8" },
  ];

  const estimateGas = async () => {
    try {
      const { tokenWithSigner, poolWithSigner, pool } = await getContracts(provider, true);
      if (!pool || !poolWithSigner) {
        return toast.error("Donation pool not configured");
      }
      const wei = parseUnits(amount || "0", 18);
      const feeData = await provider.getFeeData();
      const gasPriceWei = feeData.gasPrice || parseUnits("20", "gwei");
      setGasPrice(formatEther(gasPriceWei));

      // Estimate gas for approve
      const approveGas = await tokenWithSigner.approve.estimateGas(await pool.getAddress(), wei);
      setEstimatedGasApprove(formatEther(approveGas * gasPriceWei));

      // Estimate gas for donate
      const donateGas = await poolWithSigner.donateTo.estimateGas(ngo, wei);
      setEstimatedGasDonate(formatEther(donateGas * gasPriceWei));
    } catch (e: any) {
      console.error("Gas estimation failed:", e);
    }
  };

  const startDonationFlow = async () => {
    if (!ngo || !amount) {
      return toast.error("Please fill in NGO address and amount");
    }
    await estimateGas();
    setShowApprovalModal(true);
  };

  const approveAndProceed = async () => {
    setShowApprovalModal(false);
    setBusy(true);
    try {
      const { tokenWithSigner, pool } = await getContracts(provider, true);
      if (!pool) {
        return toast.error("Donation pool not configured");
      }
      const wei = parseUnits(amount || "0", 18);
      const tx = await tokenWithSigner.approve(await pool.getAddress(), wei);
      await tx.wait();
      toast.success("Approval granted");
      setShowDonationModal(true);
    } catch (e: any) {
      toast.error(e.message ?? "Approval failed");
    } finally {
      setBusy(false);
    }
  };

  const completeDonation = async () => {
    setShowDonationModal(false);
    setBusy(true);
    try {
      const { poolWithSigner } = await getContracts(provider, true);
      if (!poolWithSigner) {
        return toast.error("Donation pool not configured");
      }
      const wei = parseUnits(amount || "0", 18);
      // Check NGO allowlist
      const allowed = await poolWithSigner.isNGO(ngo);
      if (!allowed) {
        return toast.error("NGO address is not allowlisted");
      }
      const tx = await poolWithSigner.donateTo(ngo, wei);
      await tx.wait();
      toast.success("Donation sent successfully!");
    } catch (e: any) {
      toast.error(e.message ?? "Donation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">💚 Donate to Causes</h3>
      <p className="text-sm text-gray-600 mb-4">Support environmental initiatives with your GCT tokens</p>

      {/* NGO List - How donations are used */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">How Your Donations Help</h4>
        <div className="space-y-2">
          {ngoList.map((ngoItem) => (
            <div key={ngoItem.address} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{ngoItem.name}</span>
                <p className="text-xs text-gray-500">{ngoItem.address.slice(0, 6)}...{ngoItem.address.slice(-4)}</p>
              </div>
              <span className="text-sm text-green-600 font-semibold">{ngoItem.totalReceived} GCT received</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 form-group">
          <label className="label">NGO Address</label>
          <input
            className="input"
            placeholder="0x1234...abcd"
            value={ngo}
            onChange={(e) => setNgo(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Must be an allowlisted NGO address</p>
        </div>
        <div className="form-group">
          <label className="label">Amount to Donate</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5.00"
          />
          <p className="text-xs text-gray-500 mt-1">GCT tokens</p>
        </div>
      </div>

      {/* Gasless hint */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Future Enhancement:</strong> If your wallet supports ERC-2612 permit, donations will be gasless in one click!
        </p>
      </div>

      <button onClick={startDonationFlow} disabled={busy} className="btn btn-primary w-full mt-4">
        {busy ? "🌿 Processing..." : "💚 Donate"}
      </button>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Step 1: Approve Token Transfer</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Allow the donation pool to spend {amount} GCT tokens on your behalf.</p>
            {estimatedGasApprove && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-800 dark:text-gray-200">Estimated gas cost: <span className="font-semibold">{parseFloat(estimatedGasApprove).toFixed(6)} ETH</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gas price: {parseFloat(gasPrice).toFixed(2)} gwei</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowApprovalModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={approveAndProceed} disabled={busy} className="btn btn-primary flex-1">
                {busy ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Step 2: Complete Donation</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Send {amount} GCT tokens to the NGO.</p>
            {estimatedGasDonate && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-800 dark:text-gray-200">Estimated gas cost: <span className="font-semibold">{parseFloat(estimatedGasDonate).toFixed(6)} ETH</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gas price: {parseFloat(gasPrice).toFixed(2)} gwei</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowDonationModal(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={completeDonation} disabled={busy} className="btn btn-primary flex-1">
                {busy ? "Donating..." : "Donate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;