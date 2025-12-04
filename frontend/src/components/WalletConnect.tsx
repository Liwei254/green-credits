import React, { forwardRef, useImperativeHandle } from "react";
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { PatchedBrowserProvider } from "../utils/contract";
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
  setProvider: (provider: BrowserProvider | null) => void;
  isDemoMode?: boolean;
  setIsDemoMode?: (isDemo: boolean) => void;
};

export type WalletConnectHandle = {
  connect: () => Promise<void>;
  enableDemoMode: () => void;
};

const WalletConnect = forwardRef<WalletConnectHandle, Props>(({ address, setAddress, setProvider, isDemoMode = false, setIsDemoMode }, ref) => {
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

      // 3) Create a fresh PatchedBrowserProvider AFTER chain switch + account request
      const fresh = new PatchedBrowserProvider(ethereum);
      const signer = await fresh.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      setProvider(fresh);
      if (setIsDemoMode) setIsDemoMode(false);
      toast.success("Wallet connected");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to connect wallet");
    }
  };

  const enableDemoMode = () => {
    // Create a read-only provider connected to public RPC
    const demoProvider = new JsonRpcProvider(MOONBASE_PARAMS.rpcUrls[0]);
    setProvider(demoProvider as any);
    setAddress(""); // No address in demo mode
    if (setIsDemoMode) setIsDemoMode(true);
    toast.success("Demo mode enabled - explore read-only features!");
  };

  useImperativeHandle(ref, () => ({ connect, enableDemoMode }), []);

  const handleDisconnect = () => {
    setAddress("");
    setProvider(null);
    if (setIsDemoMode) setIsDemoMode(false);
    toast("Disconnected", { icon: "👋" });
  };

  return (
    <div>
      {address ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full" aria-label="Connected"></span>
          </div>
          <button onClick={handleDisconnect} className="btn btn-secondary text-xs" aria-label="Disconnect Wallet">
            Disconnect
          </button>
        </div>
      ) : isDemoMode ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Demo Mode
            </span>
            <span className="w-2 h-2 bg-blue-500 rounded-full" aria-label="Demo Mode"></span>
          </div>
          <button onClick={handleDisconnect} className="btn btn-secondary text-xs" aria-label="Exit Demo Mode">
            Exit Demo
          </button>
        </div>
      ) : (
        <button onClick={connect} className="btn btn-primary hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-green-500/30" aria-label="Connect Wallet">
          🔗 Connect Wallet
        </button>
      )}
    </div>
  );
});

export default WalletConnect;
