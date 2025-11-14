import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import toast from "react-hot-toast";
import erc20Abi from "../abis/erc20.json";

const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS || "";
const GCT_ADDRESS = import.meta.env.VITE_GCT_ADDRESS || import.meta.env.VITE_TOKEN_ADDRESS || "";

const verifierStakeAbi = [
  "function stakeWithGCT(uint256 amount)",
  "function unstakeGCT(uint256 amount)",
  "function gctStakes(address) view returns (uint256)",
  "function gctToken() view returns (address)"
];

interface UseStakeReturn {
  loading: boolean;
  error: string | null;
  approveAndStake: (amount: string) => Promise<any>;
  unstake: (amount: string) => Promise<any>;
  getStakedBalance: (address: string) => Promise<string>;
  getAllowance: (owner: string) => Promise<string>;
}

export function useStake(provider?: BrowserProvider): UseStakeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveAndStake = async (amount: string) => {
    if (!provider) {
      const err = "Provider not available";
      setError(err);
      toast.error(err);
      throw new Error(err);
    }

    if (!GCT_ADDRESS || !VERIFIER_ADDRESS) {
      const err = "Contract addresses not configured";
      setError(err);
      toast.error(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const gctContract = new Contract(GCT_ADDRESS, erc20Abi, signer);
      const verifierContract = new Contract(VERIFIER_ADDRESS, verifierStakeAbi, signer);

      // Parse amount (assuming 18 decimals for GCT)
      const amountWei = parseUnits(amount, 18);

      // Step 1: Approve
      toast.loading("Approving GCT tokens...", { id: "approve" });
      const approveTx = await gctContract.approve(VERIFIER_ADDRESS, amountWei);
      await approveTx.wait();
      toast.success("Approval successful!", { id: "approve" });

      // Step 2: Stake
      toast.loading("Staking GCT tokens...", { id: "stake" });
      const stakeTx = await verifierContract.stakeWithGCT(amountWei);
      const receipt = await stakeTx.wait();
      toast.success(`Successfully staked ${amount} GCT!`, { id: "stake" });

      setLoading(false);
      return receipt;
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to stake tokens";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  const unstake = async (amount: string) => {
    if (!provider) {
      const err = "Provider not available";
      setError(err);
      toast.error(err);
      throw new Error(err);
    }

    if (!VERIFIER_ADDRESS) {
      const err = "Verifier address not configured";
      setError(err);
      toast.error(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const verifierContract = new Contract(VERIFIER_ADDRESS, verifierStakeAbi, signer);

      // Parse amount (assuming 18 decimals for GCT)
      const amountWei = parseUnits(amount, 18);

      toast.loading("Unstaking GCT tokens...", { id: "unstake" });
      const unstakeTx = await verifierContract.unstakeGCT(amountWei);
      const receipt = await unstakeTx.wait();
      toast.success(`Successfully unstaked ${amount} GCT!`, { id: "unstake" });

      setLoading(false);
      return receipt;
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to unstake tokens";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  const getStakedBalance = async (address: string): Promise<string> => {
    if (!provider || !VERIFIER_ADDRESS) {
      return "0";
    }

    try {
      const verifierContract = new Contract(VERIFIER_ADDRESS, verifierStakeAbi, provider);
      const balance = await verifierContract.gctStakes(address);
      return balance.toString();
    } catch (err) {
      console.error("Error fetching staked balance:", err);
      return "0";
    }
  };

  const getAllowance = async (owner: string): Promise<string> => {
    if (!provider || !GCT_ADDRESS || !VERIFIER_ADDRESS) {
      return "0";
    }

    try {
      const gctContract = new Contract(GCT_ADDRESS, erc20Abi, provider);
      const allowance = await gctContract.allowance(owner, VERIFIER_ADDRESS);
      return allowance.toString();
    } catch (err) {
      console.error("Error fetching allowance:", err);
      return "0";
    }
  };

  return {
    loading,
    error,
    approveAndStake,
    unstake,
    getStakedBalance,
    getAllowance
  };
}
