/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  // thêm các biến môi trường khác ở đây nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
