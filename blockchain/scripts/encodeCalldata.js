#!/usr/bin/env node

/**
 * Green Credits Governance Calldata Generator
 * Generates encoded function calls for DAO proposals
 */

const { ethers } = require('ethers');

// Contract ABIs (simplified for governance functions)
const verifierAbi = [
  "function addVerifier(address account)",
  "function removeVerifier(address account)",
  "function addOracle(address account)",
  "function removeOracle(address account)",
  "function setConfig(bool instantMint, uint256 challengeWindowSecs, uint16 bufferBps, address bufferVault, uint256 submitStakeWei, uint256 verifyStakeWei, uint256 challengeStakeWei)",
  "function resolveChallenge(uint256 actionId, uint256 challengeIdx, bool upheld, address loserSlashTo)"
];

const tokenAbi = [
  "function mint(address to, uint256 amount)"
];

const poolAbi = [
  "function setNGO(address ngo, bool allowed)"
];

const registryAbi = [
  "function upsert(bytes32 id, string name, string version, string cid, bool active)"
];

const badgeAbi = [
  "function mint(address to, uint256 tokenId, uint8 level)",
  "function revoke(uint256 tokenId)",
  "function increaseReputation(address verifier, int256 amount)",
  "function decreaseReputation(address verifier, int256 amount)"
];

class CalldataGenerator {
  constructor() {
    this.contracts = {
      verifier: new ethers.Interface(verifierAbi),
      token: new ethers.Interface(tokenAbi),
      pool: new ethers.Interface(poolAbi),
      registry: new ethers.Interface(registryAbi),
      badge: new ethers.Interface(badgeAbi)
    };
  }

  // Parameter Change Proposals
  generateParameterChange(params) {
    const {
      instantMint = true,
      challengeWindowSecs = 86400, // 24 hours
      bufferBps = 1000, // 10%
      bufferVault = "0x0000000000000000000000000000000000000000",
      submitStakeWei = ethers.parseEther("0.01"),
      verifyStakeWei = ethers.parseEther("0.05"),
      challengeStakeWei = ethers.parseEther("0.1")
    } = params;

    const calldata = this.contracts.verifier.encodeFunctionData("setConfig", [
      instantMint,
      challengeWindowSecs,
      bufferBps,
      bufferVault,
      submitStakeWei,
      verifyStakeWei,
      challengeStakeWei
    ]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `Update system parameters: challenge window ${challengeWindowSecs}s, buffer ${bufferBps/100}%, stakes: submit ${ethers.formatEther(submitStakeWei)} DEV, verify ${ethers.formatEther(verifyStakeWei)} DEV, challenge ${ethers.formatEther(challengeStakeWei)} DEV`
    };
  }

  // Verifier Management Proposals
  generateAddVerifier(verifierAddress) {
    const calldata = this.contracts.verifier.encodeFunctionData("addVerifier", [verifierAddress]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `Add new verifier: ${verifierAddress}`
    };
  }

  generateRemoveVerifier(verifierAddress) {
    const calldata = this.contracts.verifier.encodeFunctionData("removeVerifier", [verifierAddress]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `Remove verifier: ${verifierAddress}`
    };
  }

  // Oracle Management Proposals
  generateAddOracle(oracleAddress) {
    const calldata = this.contracts.verifier.encodeFunctionData("addOracle", [oracleAddress]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `Add new oracle: ${oracleAddress}`
    };
  }

  generateRemoveOracle(oracleAddress) {
    const calldata = this.contracts.verifier.encodeFunctionData("removeOracle", [oracleAddress]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `Remove oracle: ${oracleAddress}`
    };
  }

  // NGO Management Proposals
  generateApproveNGO(ngoAddress) {
    const calldata = this.contracts.pool.encodeFunctionData("setNGO", [ngoAddress, true]);

    return {
      target: process.env.VITE_DONATION_POOL_ADDRESS || "0xc8d7BbE9Eef8A59F0773B3212c73c4043213862D",
      value: 0,
      calldata,
      description: `Approve NGO for donations: ${ngoAddress}`
    };
  }

  generateRejectNGO(ngoAddress) {
    const calldata = this.contracts.pool.encodeFunctionData("setNGO", [ngoAddress, false]);

    return {
      target: process.env.VITE_DONATION_POOL_ADDRESS || "0xc8d7BbE9Eef8A59F0773B3212c73c4043213862D",
      value: 0,
      calldata,
      description: `Reject NGO for donations: ${ngoAddress}`
    };
  }

  // Reputation Management Proposals
  generateMintBadge(address, tokenId, level) {
    const calldata = this.contracts.badge.encodeFunctionData("mint", [address, tokenId, level]);

    return {
      target: process.env.VITE_VERIFIER_BADGE_SBT_ADDRESS || "",
      value: 0,
      calldata,
      description: `Mint verifier badge level ${level} for ${address} (tokenId: ${tokenId})`
    };
  }

  generateAdjustReputation(address, amount) {
    const functionName = amount > 0 ? "increaseReputation" : "decreaseReputation";
    const absAmount = Math.abs(amount);

    const calldata = this.contracts.badge.encodeFunctionData(functionName, [address, absAmount]);

    return {
      target: process.env.VITE_VERIFIER_BADGE_SBT_ADDRESS || "",
      value: 0,
      calldata,
      description: `${amount > 0 ? 'Increase' : 'Decrease'} reputation for ${address} by ${absAmount}`
    };
  }

  // Challenge Resolution Proposals
  generateResolveChallenge(actionId, challengeIdx, upheld, loserSlashTo = "0x0000000000000000000000000000000000000000") {
    const calldata = this.contracts.verifier.encodeFunctionData("resolveChallenge", [
      actionId,
      challengeIdx,
      upheld,
      loserSlashTo
    ]);

    return {
      target: process.env.VITE_VERIFIER_ADDRESS || "0xcD05A86610f5C9f4FC9DA2f0724E38FDD66F94bD9",
      value: 0,
      calldata,
      description: `${upheld ? 'Uphold' : 'Dismiss'} challenge ${challengeIdx} for action ${actionId}`
    };
  }

  // Batch multiple calls
  generateBatch(calls) {
    return calls.map(call => ({
      target: call.target,
      value: call.value || 0,
      calldata: call.calldata,
      description: call.description
    }));
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const generator = new CalldataGenerator();

  if (args.length === 0) {
    console.log(`
Green Credits Governance Calldata Generator

Usage:
  node generate-calldata.js <command> [options]

Commands:
  parameter-change [options]    Generate parameter change proposal
  add-verifier <address>        Add verifier proposal
  remove-verifier <address>     Remove verifier proposal
  add-oracle <address>          Add oracle proposal
  remove-oracle <address>       Remove oracle proposal
  approve-ngo <address>         Approve NGO proposal
  reject-ngo <address>          Reject NGO proposal
  mint-badge <address> <tokenId> <level>  Mint badge proposal
  adjust-reputation <address> <amount>    Adjust reputation proposal
  resolve-challenge <actionId> <challengeIdx> <upheld> [loserAddress]  Resolve challenge proposal

Examples:
  node generate-calldata.js add-verifier 0x1234...abcd
  node generate-calldata.js parameter-change --challenge-window 172800
  node generate-calldata.js mint-badge 0x1234...abcd 1 3
    `);
    return;
  }

  const command = args[0];

  try {
    let result;

    switch (command) {
      case 'add-verifier':
        result = generator.generateAddVerifier(args[1]);
        break;

      case 'remove-verifier':
        result = generator.generateRemoveVerifier(args[1]);
        break;

      case 'add-oracle':
        result = generator.generateAddOracle(args[1]);
        break;

      case 'remove-oracle':
        result = generator.generateRemoveOracle(args[1]);
        break;

      case 'approve-ngo':
        result = generator.generateApproveNGO(args[1]);
        break;

      case 'reject-ngo':
        result = generator.generateRejectNGO(args[1]);
        break;

      case 'mint-badge':
        result = generator.generateMintBadge(args[1], args[2], parseInt(args[3]));
        break;

      case 'adjust-reputation':
        result = generator.generateAdjustReputation(args[1], parseInt(args[2]));
        break;

      case 'resolve-challenge':
        result = generator.generateResolveChallenge(
          args[1],
          args[2],
          args[3] === 'true',
          args[4] || "0x0000000000000000000000000000000000000000"
        );
        break;

      case 'parameter-change':
        // Parse additional options
        const params = {};
        for (let i = 1; i < args.length; i += 2) {
          const key = args[i].replace('--', '');
          const value = args[i + 1];

          switch (key) {
            case 'instant-mint':
              params.instantMint = value === 'true';
              break;
            case 'challenge-window':
              params.challengeWindowSecs = parseInt(value);
              break;
            case 'buffer-bps':
              params.bufferBps = parseInt(value);
              break;
            case 'buffer-vault':
              params.bufferVault = value;
              break;
            case 'submit-stake':
              params.submitStakeWei = ethers.parseEther(value);
              break;
            case 'verify-stake':
              params.verifyStakeWei = ethers.parseEther(value);
              break;
            case 'challenge-stake':
              params.challengeStakeWei = ethers.parseEther(value);
              break;
          }
        }
        result = generator.generateParameterChange(params);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error generating calldata:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CalldataGenerator;
