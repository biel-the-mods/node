import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v) {
    // eslint-disable-next-line no-console
    console.error(`[env] variável obrigatória ausente: ${name}`);
    process.exit(1);
  }
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET ?? 'artstore-bucket',
  PIX_EXPIRATION_SECONDS: Number(
    process.env.PIX_EXPIRATION_SECONDS ?? 300,
  ),
};
