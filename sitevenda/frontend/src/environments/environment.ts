export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  supabase: {
    url: 'http://localhost:54321',
    anonKey: 'coloque-sua-anon-key-publica-aqui',
  },
  pix: {
    pollIntervalMs: 3000,
    expirationSeconds: 300,
  },
};
