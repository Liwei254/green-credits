import { BrowserProvider, Contract } from "ethers";

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as string;
const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS as string;

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

const verifierAbi = [
  "function submitAction(string description, string proofCid)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp)",
  "function isVerifier(address) view returns (bool)",
  "function owner() view returns (address)"
];

export async function getContracts(provider: BrowserProvider, withSigner = false) {
  const signer = withSigner ? await provider.getSigner() : null;
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, provider);
  const verifier = new Contract(VERIFIER_ADDRESS, verifierAbi, provider);
  const tokenWithSigner = signer ? token.connect(signer) : token;
  const verifierWithSigner = signer ? verifier.connect(signer) : verifier;
  return { token, verifier, tokenWithSigner, verifierWithSigner };
}