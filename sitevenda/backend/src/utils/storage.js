import { env } from '../config/env.js';
import { sanitizeFilename } from '../utils/sanitize.js';
import { supabase } from '../config/supabase.js';

/**
 * Faz upload de um File do Multer para o bucket Supabase.
 * Retorna a URL pública do objeto.
 */
export async function uploadBuffer(file, folder) {
  if (!file) return null;
  const cleanName = sanitizeFilename(file.originalname);
  const path = `${folder}/${Date.now()}-${cleanName}`;
  const { error } = await supabase.storage
    .from(env.SUPABASE_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from(env.SUPABASE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}
