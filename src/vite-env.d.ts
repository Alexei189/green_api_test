/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GREEN_API_URL?: string;
  readonly VITE_GREEN_API_ID_INSTANCE?: string;
  readonly VITE_GREEN_API_TOKEN_INSTANCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
