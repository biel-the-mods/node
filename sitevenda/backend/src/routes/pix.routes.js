import { Router } from 'express';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

export const pixRouter = Router();

/**
 * Gera um código PIX "copia e cola" mock + txid.
 * Em produção: integrar com o seu PSP (Mercado Pago, Asaas, etc.).
 */
pixRouter.post('/gerar', async (req, res, next) => {
  try {
    const { itens } = req.body ?? {};
    if (!Array.isArray(itens) || itens.length === 0) {
      return res
        .status(400)
        .json({ message: 'itens[] é obrigatório.' });
    }
    const txid = `ELFAS${Date.now()}${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    const total = itens.reduce(
      (s, i) => s + Number(i.preco_centavos ?? 0),
      0,
    );

    // Persiste pedido como "pendente"
    const { error } = await supabase.from('pedidos').insert({
      txid,
      cliente_email: req.body?.cliente_email ?? 'anon@elfas.local',
      total_centavos: total,
      status: 'pendente',
      itens,
      expira_em: new Date(
        Date.now() + env.PIX_EXPIRATION_SECONDS * 1000,
      ).toISOString(),
    });
    if (error) throw error;

    res.json({
      txid,
      copia_e_cola: `00020126580014BR.GOV.BCB.PIX0136${txid}520400005303986540${(
        total / 100
      )
        .toFixed(2)
        .replace('.', '')}5802BR5910ELFAS DESIGN6009SAO PAULO62070503***6304ABCD`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `pix:${txid}`,
      )}`,
      expira_em_segundos: env.PIX_EXPIRATION_SECONDS,
    });
  } catch (err) {
    next(err);
  }
});

pixRouter.get('/status/:txid', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('status, expira_em')
      .eq('txid', req.params.txid)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return res
        .status(404)
        .json({ status: 'expirado', txid: req.params.txid });
    }
    if (
      data.status === 'pendente' &&
      data.expira_em &&
      new Date(data.expira_em).getTime() < Date.now()
    ) {
      await supabase
        .from('pedidos')
        .update({ status: 'expirado' })
        .eq('txid', req.params.txid);
      return res.json({ status: 'expirado', txid: req.params.txid });
    }
    res.json({ status: data.status, txid: req.params.txid });
  } catch (err) {
    next(err);
  }
});
