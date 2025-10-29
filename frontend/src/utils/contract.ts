import { BrowserProvider, Contract } from "ethers";

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || "0x517EE9424A1610aD10EA484a63B8DD4B023e40f4";
const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9";
const POOL_ADDRESS = import.meta.env.VITE_DONATION_POOL_ADDRESS || "0xc8d7BbE9Eef8A59F0773B3212c73c4043213862D";
const METHODOLOGY_REGISTRY_ADDRESS = import.meta.env.VITE_METHODOLOGY_REGISTRY_ADDRESS || "";
const BASELINE_REGISTRY_ADDRESS = import.meta.env.VITE_BASELINE_REGISTRY_ADDRESS || "";
export const USE_V2 = import.meta.env.VITE_VERIFIER_V2 === "true";

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

const verifierAbi = USE_V2 ? [
  "function submitAction(string description, string proofCid)",
  "function submitActionV2(string description, string proofCid, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid)",
  "function setAttestation(uint256 actionId, bytes32 uid)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function getActionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, bool verified, uint256 timestamp, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID)",
  "function owner() view returns (address)"
] : [
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

const methodologyRegistryAbi = [
  "function upsert(bytes32 id, string name, string version, string cid, bool active)",
  "function get(bytes32 id) view returns (string name, string version, string cid, bool active)"
];

const baselineRegistryAbi = [
  "function upsert(bytes32 id, bytes32 projectId, string version, string cid, bool active)",
  "function get(bytes32 id) view returns (bytes32 projectId, string version, string cid, bool active)"
];

export async function getContracts(provider: BrowserProvider, withSigner = false) {
  const signer = withSigner ? await provider.getSigner() : null;

  // Cast once here so component code remains clean.
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, provider) as any;
  const verifier = new Contract(VERIFIER_ADDRESS, verifierAbi, provider) as any;
  const pool = POOL_ADDRESS ? (new Contract(POOL_ADDRESS, poolAbi, provider) as any) : null;
  const methodologyRegistry = METHODOLOGY_REGISTRY_ADDRESS ? (new Contract(METHODOLOGY_REGISTRY_ADDRESS, methodologyRegistryAbi, provider) as any) : null;
  const baselineRegistry = BASELINE_REGISTRY_ADDRESS ? (new Contract(BASELINE_REGISTRY_ADDRESS, baselineRegistryAbi, provider) as any) : null;

  const tokenWithSigner = signer ? (token.connect(signer) as any) : token;
  const verifierWithSigner = signer ? (verifier.connect(signer) as any) : verifier;
  const poolWithSigner = signer && pool ? (pool.connect(signer) as any) : pool;
  const methodologyRegistryWithSigner = signer && methodologyRegistry ? (methodologyRegistry.connect(signer) as any) : methodologyRegistry;
  const baselineRegistryWithSigner = signer && baselineRegistry ? (baselineRegistry.connect(signer) as any) : baselineRegistry;

  return {
    token,
    verifier,
    pool,
    methodologyRegistry,
    baselineRegistry,
    tokenWithSigner,
    verifierWithSigner,
    poolWithSigner,
    methodologyRegistryWithSigner,
    baselineRegistryWithSigner
  };
}