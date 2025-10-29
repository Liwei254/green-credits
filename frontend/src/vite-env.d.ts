/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TOKEN_ADDRESS: string;
  readonly VITE_VERIFIER_ADDRESS: string;
  readonly VITE_DONATION_POOL_ADDRESS?: string;
  readonly VITE_METHODOLOGY_REGISTRY_ADDRESS?: string;
  readonly VITE_BASELINE_REGISTRY_ADDRESS?: string;
  readonly VITE_RETIREMENT_REGISTRY_ADDRESS?: string;
  readonly VITE_WEB3_STORAGE_TOKEN?: string;
  readonly VITE_UPLOAD_PROXY_URL?: string;
  readonly VITE_VERIFIER_HAS_PROOF?: string;
  readonly VITE_VERIFIER_V2?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }