/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_MAP_STYLE_URL: string;
  readonly VITE_GEOCODING_PROVIDER: string;
  readonly VITE_ORS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

