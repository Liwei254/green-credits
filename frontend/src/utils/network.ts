export const MOONBASE_PARAMS = {
  chainIdHex: "0x507", // 1287
  chainId: 1287,
  chainName: "Moonbase Alpha",
  nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
  rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
  blockExplorerUrls: ["https://moonbase.moonscan.io"]
};

export async function ensureMoonbase(ethereum: any) {
  if (!ethereum) throw new Error("No wallet found");
  const current = await ethereum.request({ method: "eth_chainId" });
  if (current !== MOONBASE_PARAMS.chainIdHex) {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MOONBASE_PARAMS.chainIdHex }]
      });
    } catch (e: any) {
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
}