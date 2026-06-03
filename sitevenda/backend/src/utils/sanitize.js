/**
 * Sanitiza nomes de arquivo para o Supabase Storage.
 * Remove acentos, espaços, caracteres especiais e colapsa hífens.
 * Mantém letras (a-z A-Z), números, hífen, underline e ponto.
 */
export function sanitizeFilename(originalName) {
  if (!originalName) return 'arquivo';
  const lastDot = originalName.lastIndexOf('.');
  const base = lastDot >= 0 ? originalName.slice(0, lastDot) : originalName;
  const ext = lastDot >= 0 ? originalName.slice(lastDot) : '';

  const normalized = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/[^a-zA-Z0-9_-]+/g, '-') // tudo que não é alfanumérico vira hífen
    .replace(/-+/g, '-') // colapsa hífens
    .replace(/^-+|-+$/g, '') // remove hífens nas pontas
    .toLowerCase()
    .slice(0, 80) || 'arquivo';

  return `${normalized}${ext.toLowerCase()}`;
}
