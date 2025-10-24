import React from "react";
import { BrowserProvider } from "ethers";
import { ensureMoonbase } from "../utils/network";

type Props = {
  provider: BrowserProvider | null;
  address: string;
  setAddress: (addr: string) => void;
};

const WalletConnect: React.FC<Props> = ({ provider, address, setAddress }) => {
  const connect = async () => {
    if (!provider) return alert("No wallet found. Please install MetaMask.");
    const eth = (provider as any)._getProvider();
    try {
      await ensureMoonbase(eth);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAddress(await signer.getAddress());
    } catch (e: any) {
      alert(e.message || "Failed to connect wallet");
    }
  };

  return (
    <div className="flex items-center justify-between card">
      <div>
        <h2 className="text-xl font-semibold">Wallet</h2>
        <p className="text-sm text-gray-600">Connect to Moonbase Alpha (DEV)</p>
      </div>
      <button onClick={connect} disabled={!!address} className="btn btn-primary">
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
      </button>
    </div>
  );
};

export default WalletConnect;