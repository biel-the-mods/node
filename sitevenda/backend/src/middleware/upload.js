import multer from 'multer';

/**
 * Upload em MEMÓRIA (RAM) — nada é gravado em disco no servidor.
 * Limite por arquivo: 50MB.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
