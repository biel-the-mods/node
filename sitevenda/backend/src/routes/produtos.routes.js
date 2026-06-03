import { Router } from 'express';
import { supabase } from '../config/supabase.js';

export const produtosRouter = Router();

produtosRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, slug, nome, descricao, preco_centavos, vitrine_url, model_url, categoria: categoria_id(slug)')
      .eq('ativo', true)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    res.json(
      (data ?? []).map((p) => ({
        ...p,
        categoria: p.categoria?.slug ?? 'geral',
      })),
    );
  } catch (err) {
    next(err);
  }
});

produtosRouter.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, slug, nome, descricao, preco_centavos, vitrine_url, model_url, categoria: categoria_id(slug)')
      .eq('slug', req.params.slug)
      .eq('ativo', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Produto não encontrado.' });
    res.json({ ...data, categoria: data.categoria?.slug ?? 'geral' });
  } catch (err) {
    next(err);
  }
});
