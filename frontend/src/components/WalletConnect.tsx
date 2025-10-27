import React, { forwardRef, useImperativeHandle } from "react";
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";

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

export type WalletConnectHandle = {
  connect: () => Promise<void>;
};

const WalletConnect = forwardRef<WalletConnectHandle, Props>(({ address, setAddress }, ref) => {
  const connect = async () => {
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      toast.error("No injected wallet found. Please install MetaMask.");
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
      toast.success("Wallet connected");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to connect wallet");
    }
  };

  useImperativeHandle(ref, () => ({ connect }), []);

  const handleDisconnect = () => {
    setAddress("");
    toast("Disconnected", { icon: "👋" });
  };

  return (
    <div>
      {address ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-green-800">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-label="Connected"></span>
          </div>
          <button onClick={handleDisconnect} className="btn btn-secondary text-xs" aria-label="Disconnect Wallet">
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={connect} className="btn btn-primary" aria-label="Connect Wallet">
          🔗 Connect Wallet
        </button>
      )}
    </div>
  );
});

export default WalletConnect;