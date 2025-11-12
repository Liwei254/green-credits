import { BrowserProvider, Contract, ethers } from "ethers";

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || "0x517EE9424A1610aD10EA484a63B8DD4B023e40f4";
const GCT_ADDRESS = import.meta.env.VITE_GCT_ADDRESS || import.meta.env.VITE_TOKEN_ADDRESS || TOKEN_ADDRESS;
const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9";
const POOL_ADDRESS = import.meta.env.VITE_DONATION_POOL_ADDRESS || "0xc8d7BbE9Eef8A59F0773B3212c73c4043213862D";
const METHODOLOGY_REGISTRY_ADDRESS = import.meta.env.VITE_METHODOLOGY_REGISTRY_ADDRESS || "";
const BASELINE_REGISTRY_ADDRESS = import.meta.env.VITE_BASELINE_REGISTRY_ADDRESS || "";
const RETIREMENT_REGISTRY_ADDRESS = import.meta.env.VITE_RETIREMENT_REGISTRY_ADDRESS || "";
const VERIFIER_BADGE_SBT_ADDRESS = import.meta.env.VITE_VERIFIER_BADGE_SBT_ADDRESS || "";
const MATCHING_POOL_ADDRESS = import.meta.env.VITE_MATCHING_POOL_ADDRESS || "";
const TIMELOCK_CONTROLLER_ADDRESS = import.meta.env.VITE_TIMELOCK_CONTROLLER_ADDRESS || "";
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS || "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b"; // USDC on Moonbeam

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

const verifierAbi = [
  "function submitActionV2(string description, string proofCid, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid)",
  "function setAttestation(uint256 actionId, bytes32 uid)",
  "function verifyAction(uint256 actionId, uint256 reward)",
  "function finalizeAction(uint256 actionId)",
  "function challengeAction(uint256 actionId, string evidenceCid)",
  "function resolveChallenge(uint256 actionId, uint256 challengeIdx, bool upheld, address loserSlashTo)",
  "function attachOracleReport(uint256 actionId, string cid)",
  "function depositStake(uint256 amount) payable",
  "function withdrawStake(uint256 amount)",
  "function stakeWithGCT(uint256 amount)",
  "function withdrawGCTStake(uint256 amount)",
  "function getActionCount() view returns (uint256)",
  "function actionCount() view returns (uint256)",
  "function actions(uint256) view returns (address user, string description, string proofCid, uint256 reward, uint256 timestamp, uint8 creditType, bytes32 methodologyId, bytes32 projectId, bytes32 baselineId, uint256 quantity, uint256 uncertaintyBps, uint256 durabilityYears, string metadataCid, bytes32 attestationUID, uint8 status, uint256 verifiedAt, uint256 rewardPending)",
  "function getChallenges(uint256 actionId) view returns (tuple(address challenger, string evidenceCid, uint256 timestamp, bool resolved, bool upheld)[])",
  "function getOracleReports(uint256 actionId) view returns (string[])",
  "function verifierOfAction(uint256) view returns (address)",
  "function stakeBalance(address) view returns (uint256)",
  "function gctStakes(address) view returns (uint256)",
  "function challengeWindowSecs() view returns (uint256)",
  "function submitStakeWei() view returns (uint256)",
  "function verifyStakeWei() view returns (uint256)",
  "function challengeStakeWei() view returns (uint256)",
  "function gctToken() view returns (address)",
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

const retirementRegistryAbi = [
  "function retire(uint256[] actionIds, uint256[] grams, string reason, string beneficiary) returns (uint256)",
  "function getRetirement(uint256 serial) view returns (tuple(uint256 serial, address account, uint256[] actionIds, uint256[] grams, string reason, string beneficiary, uint256 timestamp))",
  "function getRetirementsByAccount(address account) view returns (uint256[])",
  "function getRetirementCount() view returns (uint256)"
];

const verifierBadgeSBTAbi = [
  "function mint(address to, uint256 tokenId, uint8 level)",
  "function revoke(uint256 tokenId)",
  "function levelOf(uint256 tokenId) view returns (uint8)",
  "function tokenOfOwner(address owner) view returns (uint256)",
  "function reputationOf(address verifier) view returns (int256)",
  "function increaseReputation(address verifier, int256 amount)",
  "function decreaseReputation(address verifier, int256 amount)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function owner() view returns (address)"
];

const matchingPoolAbi = [
  "function createRound(address token, uint256 start, uint256 end, uint256 matchingBudget) returns (uint256)",
  "function activateRound(uint256 roundId)",
  "function deactivateRound(uint256 roundId)",
  "function addProject(uint256 roundId, bytes32 projectId, address projectAddr)",
  "function donate(uint256 roundId, bytes32 projectId, uint256 amount)",
  "function setMatchAllocations(uint256 roundId, bytes32[] projectIds, uint256[] amounts)",
  "function getRound(uint256 roundId) view returns (tuple(uint256 id, address token, uint256 start, uint256 end, uint256 matchingBudget, bool active))",
  "function projectAddress(uint256 roundId, bytes32 projectId) view returns (address)",
  "function getContribution(uint256 roundId, address donor, bytes32 projectId) view returns (uint256)",
  "function totalContributions(uint256 roundId, bytes32 projectId) view returns (uint256)",
  "function roundFinalized(uint256 roundId) view returns (bool)",
  "function owner() view returns (address)"
];

export const USE_V2 = true;

export async function getContracts(provider: BrowserProvider, withSigner = false) {
  const signer = withSigner ? await provider.getSigner() : null;

  // Patch provider to avoid ENS resolution attempts on Moonbase
  const patchedProvider = new Proxy(provider, {
    get(target, prop, receiver) {
      if (prop === 'getEnsAddress') {
        return async (name: string) => {
          // Always return null to indicate no ENS support
          return null;
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });

  // Cast once here so component code remains clean.
  const token = new Contract(TOKEN_ADDRESS, tokenAbi, patchedProvider) as any;
  const verifier = new Contract(VERIFIER_ADDRESS, verifierAbi, patchedProvider) as any;
  const pool = POOL_ADDRESS ? (new Contract(POOL_ADDRESS, poolAbi, patchedProvider) as any) : null;
  const methodologyRegistry = METHODOLOGY_REGISTRY_ADDRESS ? (new Contract(METHODOLOGY_REGISTRY_ADDRESS, methodologyRegistryAbi, patchedProvider) as any) : null;
  const baselineRegistry = BASELINE_REGISTRY_ADDRESS ? (new Contract(BASELINE_REGISTRY_ADDRESS, baselineRegistryAbi, patchedProvider) as any) : null;
  const retirementRegistry = RETIREMENT_REGISTRY_ADDRESS ? (new Contract(RETIREMENT_REGISTRY_ADDRESS, retirementRegistryAbi, patchedProvider) as any) : null;
  const verifierBadgeSBT = VERIFIER_BADGE_SBT_ADDRESS ? (new Contract(VERIFIER_BADGE_SBT_ADDRESS, verifierBadgeSBTAbi, patchedProvider) as any) : null;
  const matchingPool = MATCHING_POOL_ADDRESS ? (new Contract(MATCHING_POOL_ADDRESS, matchingPoolAbi, patchedProvider) as any) : null;

  const tokenWithSigner = signer ? (token.connect(signer) as any) : token;
  const verifierWithSigner = signer ? (verifier.connect(signer) as any) : verifier;
  const poolWithSigner = signer && pool ? (pool.connect(signer) as any) : pool;
  const methodologyRegistryWithSigner = signer && methodologyRegistry ? (methodologyRegistry.connect(signer) as any) : methodologyRegistry;
  const baselineRegistryWithSigner = signer && baselineRegistry ? (baselineRegistry.connect(signer) as any) : baselineRegistry;
  const retirementRegistryWithSigner = signer && retirementRegistry ? (retirementRegistry.connect(signer) as any) : retirementRegistry;
  const verifierBadgeSBTWithSigner = signer && verifierBadgeSBT ? (verifierBadgeSBT.connect(signer) as any) : verifierBadgeSBT;
  const matchingPoolWithSigner = signer && matchingPool ? (matchingPool.connect(signer) as any) : matchingPool;

  return {
    token,
    verifier,
    pool,
    methodologyRegistry,
    baselineRegistry,
    retirementRegistry,
    verifierBadgeSBT,
    matchingPool,
    tokenWithSigner,
    verifierWithSigner,
    poolWithSigner,
    methodologyRegistryWithSigner,
    baselineRegistryWithSigner,
    retirementRegistryWithSigner,
    verifierBadgeSBTWithSigner,
    matchingPoolWithSigner
  };
}
