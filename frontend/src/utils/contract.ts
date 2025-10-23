import { BrowserProvider, Contract } from "ethers";

// Configure these via .env in the frontend
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as string;
const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS as string;

// Minimal ABIs for required calls
const tokenAbi = [
  "function balanceOf(address) view returns (uint256)"
];

const verifierAbi = [
  "function submitAction(string description)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, uint256 reward, bool verified, uint256 timestamp)"
];

export async function getContracts(provider: BrowserProvider, withSigner = false) {
  const signer = withSigner ? await provider.getSigner() : null;
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, provider);
  const verifier = new Contract(VERIFIER_ADDRESS, verifierAbi, provider);
  const tokenWithSigner = signer ? token.connect(signer) : token;
  const verifierWithSigner = signer ? verifier.connect(signer) : verifier;
  return { token, verifier, tokenWithSigner, verifierWithSigner };
}