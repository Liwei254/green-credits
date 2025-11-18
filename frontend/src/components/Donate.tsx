import React, { useState } from "react";
import { BrowserProvider, parseUnits, formatEther } from "ethers";
import { getContracts } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const DonateNew: React.FC<Props> = ({ provider }) => {
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
    <div className="container-responsive">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">💚 Donate to Causes</h1>
          <p className="text-gray-400">Support environmental initiatives with your GCT tokens</p>
        </div>

        {/* NGO Impact Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🌍 How Your Donations Help</h2>
            <p className="card-description">See the real impact of donations to verified environmental NGOs</p>
          </div>
          <div className="space-y-3">
            {ngoList.map((ngoItem) => (
              <div key={ngoItem.address} className="flex-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{ngoItem.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{ngoItem.address.slice(0, 8)}...{ngoItem.address.slice(-6)}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{ngoItem.totalReceived} GCT</div>
                  <div className="text-xs text-gray-500">Total received</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💰 Make a Donation</h2>
            <p className="card-description">Contribute to environmental causes and earn social impact rewards</p>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">NGO Address</label>
                <input
                  className="input"
                  placeholder="0x1234...abcd"
                  value={ngo}
                  onChange={(e) => setNgo(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be an allowlisted NGO address</p>
              </div>
              <div className="form-group">
                <label className="label">Amount to Donate</label>
                <div className="relative">
                  <input
                    className="input pr-16"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5.00"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    GCT
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Green Credit Tokens</p>
              </div>
            </div>

            {/* Future Enhancement Notice */}
            <div className="bg-info-bg border border-info rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-info text-lg">💡</div>
                <div>
                  <h4 className="font-semibold text-info text-sm mb-1">Future Enhancement</h4>
                  <p className="text-sm text-gray-700">If your wallet supports ERC-2612 permit, donations will be gasless in one click!</p>
                </div>
              </div>
            </div>

            <button onClick={startDonationFlow} disabled={busy} className="btn btn-primary btn-full">
              {busy ? "⏳ Processing..." : "💚 Start Donation"}
            </button>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">🔐 Step 1: Approve Token Transfer</h2>
              </div>
              <div className="modal-body">
                <div className="stepper">
                  <div className="step active">
                    <div className="step-circle">1</div>
                    <div className="step-label">Approve</div>
                  </div>
                  <div className="step">
                    <div className="step-circle">2</div>
                    <div className="step-label">Donate</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{amount} GCT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-mono text-xs">{ngo.slice(0, 10)}...{ngo.slice(-8)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Allow the donation pool to spend <strong>{amount} GCT</strong> tokens on your behalf.
                  This approval is required before making the donation.
                </p>

                {estimatedGasApprove && (
                  <div className="bg-warning-bg border border-warning rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-warning text-lg">⛽</div>
                      <div className="text-sm font-medium text-warning">Estimated Gas Cost</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {Number(estimatedGasApprove).toFixed(6)} ETH
                    </div>
                    <div className="text-sm text-gray-600">
                      at {Number(gasPrice).toFixed(1)} gwei gas price
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowApprovalModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={approveAndProceed} disabled={busy} className="btn btn-primary">
                  {busy ? "⏳ Approving..." : "✅ Approve & Continue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Donation Modal */}
        {showDonationModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">🎉 Step 2: Complete Donation</h2>
              </div>
              <div className="modal-body">
                <div className="stepper">
                  <div className="step completed">
                    <div className="step-circle">✓</div>
                    <div className="step-label">Approved</div>
                  </div>
                  <div className="step active">
                    <div className="step-circle">2</div>
                    <div className="step-label">Donate</div>
                  </div>
                </div>

                <div className="bg-success-bg border border-success rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-success mb-2">Ready to Donate!</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Amount:</span>
                      <span className="font-bold text-success">{amount} GCT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Recipient:</span>
                      <span className="font-mono text-xs">{ngo.slice(0, 10)}...{ngo.slice(-8)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">
                  Complete your donation of <strong>{amount} GCT</strong> to support environmental initiatives.
                  Your contribution will make a real difference!
                </p>

                {estimatedGasDonate && (
                  <div className="bg-warning-bg border border-warning rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-warning text-lg">⛽</div>
                      <div className="text-sm font-medium text-warning">Estimated Gas Cost</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {Number(estimatedGasDonate).toFixed(6)} ETH
                    </div>
                    <div className="text-sm text-gray-600">
                      at {Number(gasPrice).toFixed(1)} gwei gas price
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowDonationModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={completeDonation} disabled={busy} className="btn btn-success">
                  {busy ? "⏳ Processing..." : "🎉 Complete Donation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateNew;
