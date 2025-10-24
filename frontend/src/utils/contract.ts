import { BrowserProvider, Contract } from "ethers";

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS as string;
const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS as string;
const POOL_ADDRESS = import.meta.env.VITE_DONATION_POOL_ADDRESS as string | undefined;

const HAS_PROOF = String(import.meta.env.VITE_VERIFIER_HAS_PROOF || "false").toLowerCase() === "true";

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

const verifierAbiBasic = [
  "function submitAction(string description)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, uint256 reward, bool verified, uint256 timestamp)",
  "function owner() view returns (address)"
];

const verifierAbiWithProof = [
  "function submitAction(string description, string proofCid)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp)",
  "function owner() view returns (address)"
];

const poolAbi = [
  "function donateTo(address ngo, uint256 amount)",
  "function isNGO(address ngo) view returns (bool)"
];

export async function getContracts(provider: BrowserProvider, withSigner = false) {
  const signer = withSigner ? await provider.getSigner() : null;

  // Cast once here so component code remains clean.
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, provider) as any;
  const verifierAbi = HAS_PROOF ? verifierAbiWithProof : verifierAbiBasic;
  const verifier = new Contract(VERIFIER_ADDRESS, verifierAbi, provider) as any;
  const pool = POOL_ADDRESS ? (new Contract(POOL_ADDRESS, poolAbi, provider) as any) : null;

  const tokenWithSigner = signer ? (token.connect(signer) as any) : token;
  const verifierWithSigner = signer ? (verifier.connect(signer) as any) : verifier;
  const poolWithSigner = signer && pool ? (pool.connect(signer) as any) : pool;

  return { token, verifier, pool, tokenWithSigner, verifierWithSigner, poolWithSigner };
}