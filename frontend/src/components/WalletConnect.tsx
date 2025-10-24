import React from "react";
import { BrowserProvider } from "ethers";

const MOONBASE_PARAMS = {
  chainId: "0x507", // 1287
  chainName: "Moonbase Alpha",
  nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
  blockExplorerUrls: ["https://moonbase.moonscan.io"]
};

// Prefer MetaMask if multiple providers are injected
function getInjectedProvider(): any {
  const eth = (window as any).ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers)) {
    const mm = eth.providers.find((p: any) => p && p.isMetaMask);
    return mm ?? eth.providers[0];
  }
  return eth;
}

type Props = {
  provider: BrowserProvider | null;
  address: string;
  setAddress: (addr: string) => void;
};

const WalletConnect: React.FC<Props> = ({ address, setAddress }) => {
  const connect = async () => {
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      alert("No injected wallet found. Please install MetaMask.");
      return;
    }

    try {
      // 1) Ensure chain = Moonbase Alpha (1287)
      const currentChain: string = await ethereum.request({ method: "eth_chainId" });
      if (currentChain !== MOONBASE_PARAMS.chainId) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MOONBASE_PARAMS.chainId }]
          });
        } catch (e: any) {
          // Add chain if it doesn't exist
          if (e?.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MOONBASE_PARAMS]
            });
          } else {
            throw e;
          }
        }
      }

      // 2) Request accounts using the raw provider API
      await ethereum.request({ method: "eth_requestAccounts" });

      // 3) Create a fresh BrowserProvider AFTER chain switch + account request
      const fresh = new BrowserProvider(ethereum);
      const signer = await fresh.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to connect wallet");
    }
  };

  return (
    <div style={{ margin: "12px 0" }}>
      <button onClick={connect} disabled={!!address}>
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
      </button>
    </div>
  );
};

export default WalletConnect;