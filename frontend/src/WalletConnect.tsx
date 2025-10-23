import React from "react";
import { BrowserProvider } from "ethers";

type Props = {
  provider: BrowserProvider | null;
  address: string;
  setAddress: (addr: string) => void;
};

const WalletConnect: React.FC<Props> = ({ provider, address, setAddress }) => {
  const connect = async () => {
    if (!provider) {
      alert("No Ethereum provider found. Install MetaMask.");
      return;
    }
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setAddress(await signer.getAddress());
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