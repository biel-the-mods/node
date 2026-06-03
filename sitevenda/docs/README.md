# Documentação — Elfas Design

## Índice

- [Schema do banco](./schema.sql)
- [Arquitetura](#arquitetura)
- [Fluxo do checkout PIX](#fluxo-do-checkout-pix)
- [Regras estritas](#regras-estritas)

## Arquitetura

```
┌──────────────┐      HTTPS       ┌──────────────────┐
│  Browser     │ ◀──────────────▶ │  Angular SSR     │
│  (mobile /   │                  │  (frontend)      │
│   desktop)   │                  └────────┬─────────┘
└──────────────┘                           │
                                           │ REST
                                           ▼
                                  ┌──────────────────┐
                                  │  Express API     │
                                  │  (backend)       │
                                  └────────┬─────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                                 ▼
                  ┌───────────────┐                ┌────────────────┐
                  │  Supabase DB  │                │  Supabase      │
                  │  (Postgres)   │                │  Storage       │
                  │               │                │  artstore-bucket│
                  └───────────────┘                └────────────────┘
```

## Fluxo do checkout PIX

1. `POST /pix/gerar` → backend cria pedido `pendente` + txid
2. Frontend exibe o **PIX Copia/Cola** + QR Code
3. **Timer regressivo 5min** persistente (controlado pelo `setInterval`
   dentro do componente, considerando `expira_em_segundos` do backend)
4. **Polling a cada 3s** em `GET /pix/status/:txid`
5. Quando o backend marcar `status='pago'`, o frontend libera a confirmação
6. Se o tempo acabar, o backend converte para `expirado` no próximo GET

## Regras estritas

### Frontend (Angular)

- **Standalone Components** sempre. Nada de `NgModule`.
- **Signals** para estado local e reatividade.
- **TS1308:** nunca usar `await` dentro de `signal.update()`. Sempre
  resolver o valor fora e passar para `.set()` ou para um novo array
  calculado externamente.
- **Tailwind quebrado em várias linhas** nos templates para evitar
  `NG5002` no editor mobile.
- **Toasts** âmbar para feedback (serviço global, sem duplicar markup).

### Backend (Express)

- **Multer em memória** (`multer.memoryStorage`). Nada de disco.
- Sempre checar `Array.isArray(req.files)` e se `files.length > 0`
  antes de acessar `files[0]` ou `find(f => …)`.
- **Nomes de arquivo** passam por `sanitizeFilename` antes do upload
  para o Supabase (remove acentos, caracteres especiais, colapsa hífens).
- **Try/catch globais:** cada rota tem seu próprio `try/catch` que
  repassa para o `errorHandler` central (4 args) no `server.js`.
- **CORS:** configurável via `CORS_ORIGIN` no `.env`.
