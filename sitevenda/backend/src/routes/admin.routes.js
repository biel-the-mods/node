import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadBuffer } from '../utils/storage.js';
import { supabase } from '../config/supabase.js';

export const adminRouter = Router();

// ===== produtos =====
adminRouter.post('/produtos', upload.any(), async (req, res, next) => {
  try {
    // Regra estrita: checar req.files antes de acessar propriedades
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
    const findFile = (name) => files.find((f) => f.fieldname === name) ?? null;

    const vitrine = findFile('vitrine');
    if (!vitrine) {
      return res
        .status(400)
        .json({ message: 'Imagem de vitrine é obrigatória.' });
    }

    const vitrineUrl = await uploadBuffer(vitrine, 'produtos/vitrines');
    const modelUrl = await uploadBuffer(findFile('modelo'), 'produtos/modelos');
    const zipUrl = await uploadBuffer(findFile('zip'), 'produtos/zips');
    const cdrUrl = await uploadBuffer(findFile('cdr'), 'produtos/cdrs');

    const { data, error } = await supabase
      .from('produtos')
      .insert({
        nome: req.body.nome,
        slug: req.body.slug,
        descricao: req.body.descricao ?? '',
        preco_centavos: Number(req.body.preco_centavos),
        vitrine_url: vitrineUrl,
        model_url: modelUrl,
        zip_url: zipUrl,
        cdr_url: cdrUrl,
        categoria_slug: req.body.categoria_slug || null,
        ativo: true,
      })
      .select('id')
      .single();
    if (error) throw error;
    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

// ===== categorias =====
adminRouter.post('/categorias', async (req, res, next) => {
  try {
    const { nome, slug } = req.body ?? {};
    if (!nome || !slug) {
      return res
        .status(400)
        .json({ message: 'nome e slug são obrigatórios.' });
    }
    const { data, error } = await supabase
      .from('categorias')
      .insert({ nome, slug })
      .select('id, nome, slug')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// ===== cupons =====
adminRouter.post('/cupons', async (req, res, next) => {
  try {
    const { codigo, percentual } = req.body ?? {};
    if (!codigo || !percentual) {
      return res
        .status(400)
        .json({ message: 'codigo e percentual são obrigatórios.' });
    }
    const { data, error } = await supabase
      .from('cupons')
      .insert({
        codigo: String(codigo).toUpperCase(),
        percentual: Number(percentual),
        ativo: true,
      })
      .select('id, codigo, percentual, ativo')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// ===== pedidos =====
adminRouter.get('/pedidos', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id, cliente_email, total_centavos, status, criado_em')
      .order('criado_em', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    next(err);
  }
});
