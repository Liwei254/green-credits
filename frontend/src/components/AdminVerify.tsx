import React, { useEffect, useState } from "react";
import { BrowserProvider, parseUnits, formatEther } from "ethers";
import { getContracts, USE_V2 } from "../utils/contract";
import toast from "react-hot-toast";

type Props = { provider: BrowserProvider };

const AdminVerify: React.FC<Props> = ({ provider }) => {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState("10");
  const [isOwner, setIsOwner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("0.01");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [challengeEvidence, setChallengeEvidence] = useState("");
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [loserSlashTo, setLoserSlashTo] = useState("");
  const [oracleCid, setOracleCid] = useState("");
  const [attestationUID, setAttestationUID] = useState("");
  
  // Phase 2 config state
  const [challengeWindow, setChallengeWindow] = useState(0);
  const [myStakeBalance, setMyStakeBalance] = useState("0");
  const [submitStake, setSubmitStake] = useState("0");
  const [verifyStake, setVerifyStake] = useState("0");
  const [challengeStake, setChallengeStake] = useState("0");

  useEffect(() => {
    (async () => {
      const { verifier } = await getContracts(provider);
      const c: bigint = await verifier.getActionCount();
      setCount(Number(c));
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const owner = await verifier.owner();
      setIsOwner(me.toLowerCase() === owner.toLowerCase());
      
      // Load Phase 2 config if V2 enabled
      if (USE_V2) {
        try {
          const window: bigint = await verifier.challengeWindowSecs();
          setChallengeWindow(Number(window));
          const myBalance: bigint = await verifier.stakeBalance(me);
          setMyStakeBalance(formatEther(myBalance));
          const subStake: bigint = await verifier.submitStakeWei();
          setSubmitStake(formatEther(subStake));
          const verStake: bigint = await verifier.verifyStakeWei();
          setVerifyStake(formatEther(verStake));
          const chalStake: bigint = await verifier.challengeStakeWei();
          setChallengeStake(formatEther(chalStake));
        } catch (e) {
          console.warn("Could not load Phase 2 config:", e);
        }
      }
    })().catch(console.error);
  }, [provider]);

  const verify = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const wei = parseUnits(amount || "0", 18);
      const tx = await verifierWithSigner.verifyAction(selected, wei);
      await tx.wait();
      toast.success("Action verified");
    } catch (e: any) {
      toast.error(e.message ?? "Verify failed");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const tx = await verifierWithSigner.finalizeAction(selected);
      await tx.wait();
      toast.success("Action finalized");
    } catch (e: any) {
      toast.error(e.message ?? "Finalize failed");
    } finally {
      setBusy(false);
    }
  };

  const challenge = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const tx = await verifierWithSigner.challengeAction(selected, challengeEvidence);
      await tx.wait();
      toast.success("Action challenged");
    } catch (e: any) {
      toast.error(e.message ?? "Challenge failed");
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (upheld: boolean) => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const tx = await verifierWithSigner.resolveChallenge(
        selected,
        challengeIdx,
        upheld,
        loserSlashTo || "0x0000000000000000000000000000000000000000"
      );
      await tx.wait();
      toast.success(`Challenge ${upheld ? "upheld" : "dismissed"}`);
    } catch (e: any) {
      toast.error(e.message ?? "Resolve failed");
    } finally {
      setBusy(false);
    }
  };

  const depositStakeFn = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const wei = parseUnits(stakeAmount || "0", 18);
      const tx = await verifierWithSigner.depositStake({ value: wei });
      await tx.wait();
      toast.success("Stake deposited");
      // Refresh balance
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const myBalance: bigint = await verifierWithSigner.stakeBalance(me);
      setMyStakeBalance(formatEther(myBalance));
    } catch (e: any) {
      toast.error(e.message ?? "Deposit failed");
    } finally {
      setBusy(false);
    }
  };

  const withdrawStakeFn = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const wei = parseUnits(withdrawAmount || "0", 18);
      const tx = await verifierWithSigner.withdrawStake(wei);
      await tx.wait();
      toast.success("Stake withdrawn");
      // Refresh balance
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const myBalance: bigint = await verifierWithSigner.stakeBalance(me);
      setMyStakeBalance(formatEther(myBalance));
    } catch (e: any) {
      toast.error(e.message ?? "Withdraw failed");
    } finally {
      setBusy(false);
    }
  };

  const attachReport = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      const tx = await verifierWithSigner.attachOracleReport(selected, oracleCid);
      await tx.wait();
      toast.success("Oracle report attached");
    } catch (e: any) {
      toast.error(e.message ?? "Attach failed");
    } finally {
      setBusy(false);
    }
  };

  const setAttestation = async () => {
    setBusy(true);
    try {
      const { verifierWithSigner } = await getContracts(provider, true);
      // Convert string to bytes32 - pad or truncate to 32 bytes
      const bytes32UID = attestationUID.startsWith("0x") 
        ? attestationUID.padEnd(66, "0") 
        : "0x" + attestationUID.slice(0, 64).padEnd(64, "0");
      const tx = await verifierWithSigner.setAttestation(selected, bytes32UID);
      await tx.wait();
      toast.success("Attestation UID attached");
    } catch (e: any) {
      toast.error(e.message ?? "Set attestation failed");
    } finally {
      setBusy(false);
    }
  };

  if (!isOwner) return null;

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">🔍 Admin: Verify Actions</h3>
      <p className="text-sm text-gray-600 mb-4">Review and verify eco-actions to reward contributors</p>
      
      {USE_V2 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Phase 2 Configuration</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Challenge Window:</span>
              <p className="font-medium">{Math.round(challengeWindow / 3600)}h</p>
            </div>
            <div>
              <span className="text-gray-600">Submit Stake:</span>
              <p className="font-medium">{submitStake} DEV</p>
            </div>
            <div>
              <span className="text-gray-600">Verify Stake:</span>
              <p className="font-medium">{verifyStake} DEV</p>
            </div>
            <div>
              <span className="text-gray-600">Challenge Stake:</span>
              <p className="font-medium">{challengeStake} DEV</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-gray-600 text-xs">Your Stake Balance:</span>
            <p className="font-semibold text-green-600">{myStakeBalance} DEV</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="form-group">
          <label className="label">Action ID</label>
          <input
            className="input"
            type="number"
            min={0}
            max={Math.max(0, count - 1)}
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0 - {Math.max(0, count - 1)}</p>
        </div>
        <div className="form-group">
          <label className="label">Reward Amount</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.00"
          />
          <p className="text-xs text-gray-500 mt-1">GCT tokens to award</p>
        </div>
        <div className="flex items-end">
          <button onClick={verify} disabled={busy} className="btn btn-primary w-full">
            {busy ? "🔄 Verifying..." : "✅ Verify & Reward"}
          </button>
        </div>
      </div>

      {USE_V2 && (
        <>
          <div className="border-t pt-4 mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Phase 2: Finalize & Challenge</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <button onClick={finalize} disabled={busy} className="btn btn-success w-full mb-3">
                  {busy ? "🔄 Finalizing..." : "✔️ Finalize Action"}
                </button>
                <p className="text-xs text-gray-500">Mint rewards after challenge window</p>
              </div>
              <div>
                <input
                  className="input mb-2"
                  type="text"
                  value={challengeEvidence}
                  onChange={(e) => setChallengeEvidence(e.target.value)}
                  placeholder="Evidence CID"
                />
                <button onClick={challenge} disabled={busy} className="btn btn-warning w-full">
                  {busy ? "🔄 Challenging..." : "⚠️ Challenge Action"}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Resolve Challenge</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="input"
                type="number"
                min={0}
                value={challengeIdx}
                onChange={(e) => setChallengeIdx(Number(e.target.value))}
                placeholder="Challenge Index"
              />
              <input
                className="input"
                type="text"
                value={loserSlashTo}
                onChange={(e) => setLoserSlashTo(e.target.value)}
                placeholder="Slash to address (optional)"
              />
              <div className="flex gap-2">
                <button onClick={() => resolve(true)} disabled={busy} className="btn btn-danger flex-1">
                  Uphold
                </button>
                <button onClick={() => resolve(false)} disabled={busy} className="btn btn-secondary flex-1">
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <h4 className="font-semibold mb-3 text-gray-700">Stake Management</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-sm">Deposit Stake</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.01"
                  />
                  <button onClick={depositStakeFn} disabled={busy} className="btn btn-primary">
                    Deposit
                  </button>
                </div>
              </div>
              <div>
                <label className="label text-sm">Withdraw Stake</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.01"
                  />
                  <button onClick={withdrawStakeFn} disabled={busy} className="btn btn-secondary">
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-gray-700">Oracle Report</h4>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="text"
                value={oracleCid}
                onChange={(e) => setOracleCid(e.target.value)}
                placeholder="Report CID (IPFS)"
              />
              <button onClick={attachReport} disabled={busy} className="btn btn-info">
                {busy ? "🔄 Attaching..." : "📎 Attach"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Attach IPFS CID with audit data (NDVI, LCA, etc.)
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 text-gray-700">Attestation UID</h4>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="text"
                value={attestationUID}
                onChange={(e) => setAttestationUID(e.target.value)}
                placeholder="Attestation UID (bytes32 or hex string)"
              />
              <button onClick={setAttestation} disabled={busy} className="btn btn-info">
                {busy ? "🔄 Setting..." : "🔗 Attach UID"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Link to external attestation (e.g., EAS, Sign Protocol)
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminVerify;