import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Cliente Supabase com a SERVICE ROLE KEY.
 * ⚠️ NUNCA exponha esse cliente ao navegador.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
