import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,  // ✅ Enable intermediate representation compiler
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    moonbase: {
      url: "https://rpc.api.moonbase.moonbeam.network",
      chainId: 1287,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    moonbasealpha: {
      url: process.env.MOONBEAM_ALPHA_RPC || "https://rpc.api.moonbase.moonbeam.network",
      chainId: 1287,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : 
                (process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []),
      gasPrice: 1000000000, // 1 gwei
    },
    moonbeam: {
      url: "https://rpc.api.moonbeam.network",
      chainId: 1284,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 100000000000, // 100 gwei (mainnet gas price)
    },
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: process.env.MOONSCAN_API_KEY || "",
      moonbeam: process.env.MOONSCAN_API_KEY || "",
    },
  },
};

export default config;
