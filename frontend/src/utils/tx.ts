import toast from "react-hot-toast";
import { TransactionReceipt, TransactionResponse } from "ethers";

const MOONBEAM_ALPHA_CHAIN_ID = 1287;
const MOONBEAM_ALPHA_EXPLORER = "https://moonbase.moonscan.io";

/**
 * Get the explorer URL for a transaction hash
 */
export function getExplorerTxUrl(txHash: string, chainId?: number): string {
  const currentChainId = chainId || MOONBEAM_ALPHA_CHAIN_ID;
  
  if (currentChainId === 1287) {
    return `${MOONBEAM_ALPHA_EXPLORER}/tx/${txHash}`;
  } else if (currentChainId === 1284) {
    return `https://moonscan.io/tx/${txHash}`;
  } else if (currentChainId === 31337) {
    // Localhost - no explorer
    return "";
  }
  
  return `${MOONBEAM_ALPHA_EXPLORER}/tx/${txHash}`;
}

/**
 * Get the explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, chainId?: number): string {
  const currentChainId = chainId || MOONBEAM_ALPHA_CHAIN_ID;
  
  if (currentChainId === 1287) {
    return `${MOONBEAM_ALPHA_EXPLORER}/address/${address}`;
  } else if (currentChainId === 1284) {
    return `https://moonscan.io/address/${address}`;
  } else if (currentChainId === 31337) {
    return "";
  }
  
  return `${MOONBEAM_ALPHA_EXPLORER}/address/${address}`;
}

/**
 * Monitor a transaction and show toast notifications
 */
export async function monitorTransaction(
  tx: TransactionResponse,
  options?: {
    pending?: string;
    success?: string;
    error?: string;
    chainId?: number;
  }
): Promise<TransactionReceipt> {
  const pendingMsg = options?.pending || "Transaction pending...";
  const successMsg = options?.success || "Transaction confirmed!";
  const errorMsg = options?.error || "Transaction failed";
  
  const toastId = toast.loading(pendingMsg);
  
  try {
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error("Transaction receipt is null");
    }
    
    const explorerUrl = getExplorerTxUrl(receipt.hash, options?.chainId);
    
    toast.success(
      <div>
        <div>{successMsg}</div>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
          >
            View on Explorer
          </a>
        )}
      </div>,
      { id: toastId, duration: 5000 }
    );
    
    return receipt;
  } catch (error: any) {
    console.error("Transaction error:", error);
    toast.error(errorMsg + ": " + (error?.message || "Unknown error"), { id: toastId });
    throw error;
  }
}

/**
 * Show a transaction link in a toast
 */
export function showTransactionToast(
  txHash: string,
  message: string,
  chainId?: number
) {
  const explorerUrl = getExplorerTxUrl(txHash, chainId);
  
  if (explorerUrl) {
    toast.success(
      <div>
        <div>{message}</div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline"
        >
          View on Explorer
        </a>
      </div>,
      { duration: 5000 }
    );
  } else {
    toast.success(message);
  }
}

/**
 * Format error messages from transaction errors
 */
export function formatTransactionError(error: any): string {
  if (error?.reason) {
    return error.reason;
  }
  
  if (error?.message) {
    // Extract user-friendly message from error
    if (error.message.includes("user rejected")) {
      return "Transaction rejected by user";
    }
    if (error.message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }
    if (error.message.includes("nonce")) {
      return "Nonce error - please try again";
    }
    return error.message;
  }
  
  return "Transaction failed";
}
