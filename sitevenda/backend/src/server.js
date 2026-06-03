import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { produtosRouter } from './routes/produtos.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { pixRouter } from './routes/pix.routes.js';

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use('/produtos', produtosRouter);
app.use('/admin', adminRouter);
app.use('/pix', pixRouter);

// 404
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Rota não encontrada: ${req.method} ${req.path}` });
});

// Error handler global
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('[erro]', err);
  res.status(500).json({
    message: err?.message ?? 'Erro interno do servidor.',
  });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `🜲 Elfas Design API em http://localhost:${env.PORT}  (${env.NODE_ENV})`,
  );
});
