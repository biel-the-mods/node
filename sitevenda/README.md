# 🜲 Elfas Design

> Plataforma de e-commerce premium de mockups digitais e design interativo de camisetas em 3D.

**Dono da marca:** Elfas  
**Conceito visual:** *Amber & Charcoal* (Âmbar e Carvão)

---

## 🜂 Identidade Visual

| Token              | Valor                                                |
|--------------------|------------------------------------------------------|
| Fundo              | `#0f0f11` (chumbo profundo)                          |
| Primária (Âmbar)   | `#f59e0b` / `amber-500`                              |
| Texto primário     | `#fef3c7` (branco gelado/dourado pálido)             |
| Superfícies        | `backdrop-blur` + bordas finíssimas (glassmorphism)  |
| Tipografia         | Caixa alta (uppercase) em destaques                  |
| Movimento          | `animate-pulse` em selos de promoção                 |

## 🜃 Stack

| Camada    | Tecnologia                                                                          |
|-----------|-------------------------------------------------------------------------------------|
| Frontend  | Angular (Standalone Components, Signals, SSR) + Tailwind CSS                        |
| Backend   | Node.js + Express + Multer (upload em memória RAM)                                  |
| Banco     | Supabase (PostgreSQL)                                                                |
| Storage   | Supabase Storage — bucket público `artstore-bucket`                                 |
| Pagamento | PIX Copia/Cola (timer 5min + polling 3s)                                            |
| 3D        | Google `<model-viewer>` (`.glb` / `.gltf`)                                          |

## 🜁 Estrutura

```
sitevenda/
├── frontend/   # Angular SSR + Tailwind
├── backend/    # Express + Multer + Supabase client
└── docs/       # Documentação, contrato da API, schema do banco
```

## 🜄 Como rodar (dev)

```bash
# Backend
cd backend
cp .env.example .env       # preencha as variáveis Supabase + porta
npm install
npm run dev                # http://localhost:3000

# Frontend
cd ../frontend
cp .env.example .env       # preencha a URL do backend e a publicAnonKey
npm install
npm run start              # http://localhost:4200
```

## 🜔 Regras estritas de código

1. **Arquivos 100% completos.** Nada de `// resto do código aqui`.
2. **HTML/Tailwind quebrado em várias linhas** (evita `NG5002` no editor mobile).
3. **Signals:** nunca `await` dentro de `signal.update()` (regra `TS1308`).
4. **Multer:** sempre checar `req.files` antes de acessar propriedades.
5. **Storage:** nomes de arquivo no Supabase passam por Regex para remover caracteres especiais.
6. **Erros:** `try/catch` globais no front e no back + Toasts customizados em cor Âmbar.

---

© Elfas Design — todos os direitos reservados.
