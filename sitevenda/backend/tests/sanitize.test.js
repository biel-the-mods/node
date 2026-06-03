// Testes do sanitize de nome de arquivo
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilename } from '../src/utils/sanitize.js';

test('sanitize mantém nome simples', () => {
  assert.equal(sanitizeFilename('foto.png'), 'foto.png');
});

test('sanitize remove acentos', () => {
  assert.equal(sanitizeFilename('camiseta-preta.JPG'), 'camiseta-preta.jpg');
});

test('sanitize remove espaços', () => {
  assert.equal(sanitizeFilename('minha foto 1.jpeg'), 'minha-foto-1.jpeg');
});

test('sanitize remove caracteres especiais', () => {
  // underscores são permitidos (regex [^a-zA-Z0-9_-])
  assert.equal(
    sanitizeFilename('mock@#$%design_v2.glb'),
    'mock-design_v2.glb',
  );
  // hífens múltiplos viram um só
  assert.equal(
    sanitizeFilename('a--b@@@c.glb'),
    'a-b-c.glb',
  );
});

test('sanitize colapsa hífens múltiplos', () => {
  assert.equal(
    sanitizeFilename('a----b---c.glb'),
    'a-b-c.glb',
  );
});

test('sanitize retorna "arquivo" para entrada vazia', () => {
  assert.equal(sanitizeFilename(''), 'arquivo');
  assert.equal(sanitizeFilename(null), 'arquivo');
  assert.equal(sanitizeFilename(undefined), 'arquivo');
});

test('sanitize corta nomes muito longos', () => {
  const big = 'a'.repeat(200) + '.glb';
  const out = sanitizeFilename(big);
  assert.ok(out.length < 100, `saída muito longa: ${out.length}`);
  assert.ok(out.endsWith('.glb'));
});

test('sanitize preserva extensão em minúscula', () => {
  assert.equal(sanitizeFilename('ARTE.GLB'), 'arte.glb');
});
