import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { getContracts } from "../utils/contract";

export interface UseStakeResult {
  staking: boolean;
  approving: boolean;
  error: string | null;
  approveAndStake: (provider: BrowserProvider, amountGCT: string) => Promise<void>;
  withdrawStake: (provider: BrowserProvider, amountGCT: string) => Promise<void>;
  getStakeBalance: (provider: BrowserProvider, userAddress: string) => Promise<string>;
}

/**
 * Hook for managing GCT token staking with EcoActionVerifier
 * Implements approve + stake workflow using Ethers v6
 */
export function useStake(): UseStakeResult {
  const [staking, setStaking] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Approve and stake GCT tokens in one flow
   */
  const approveAndStake = async (provider: BrowserProvider, amountGCT: string) => {
    setError(null);
    
    try {
      const amount = parseUnits(amountGCT, 18);
      
      // Get contracts with signer
      const { tokenWithSigner, verifierWithSigner } = await getContracts(provider, true);
      const verifierAddress = await verifierWithSigner.getAddress();

      // Step 1: Approve
      setApproving(true);
      console.log("Approving GCT tokens...");
      const approveTx = await tokenWithSigner.approve(verifierAddress, amount);
      await approveTx.wait();
      console.log("Approval confirmed");

      // Step 2: Stake
      setApproving(false);
      setStaking(true);
      console.log("Staking GCT tokens...");
      const stakeTx = await verifierWithSigner.stakeWithGCT(amount);
      await stakeTx.wait();
      console.log("Staking confirmed");

      setStaking(false);
    } catch (err: any) {
      console.error("Stake error:", err);
      setError(err.message || "Failed to stake tokens");
      setApproving(false);
      setStaking(false);
      throw err;
    }
  };

  /**
   * Withdraw staked GCT tokens
   */
  const withdrawStake = async (provider: BrowserProvider, amountGCT: string) => {
    setError(null);
    setStaking(true);
    
    try {
      const amount = parseUnits(amountGCT, 18);
      
      // Get contracts with signer
      const { verifierWithSigner } = await getContracts(provider, true);

      console.log("Withdrawing GCT stake...");
      const withdrawTx = await verifierWithSigner.withdrawGCTStake(amount);
      await withdrawTx.wait();
      console.log("Withdrawal confirmed");

      setStaking(false);
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setError(err.message || "Failed to withdraw stake");
      setStaking(false);
      throw err;
    }
  };

  /**
   * Get current stake balance for a user
   */
  const getStakeBalance = async (provider: BrowserProvider, userAddress: string): Promise<string> => {
    try {
      const { verifier } = await getContracts(provider, false);
      const balance = await verifier.gctStakes(userAddress);
      return balance.toString();
    } catch (err: any) {
      console.error("Error fetching stake balance:", err);
      return "0";
    }
  };

  return {
    staking,
    approving,
    error,
    approveAndStake,
    withdrawStake,
    getStakeBalance,
  };
}
