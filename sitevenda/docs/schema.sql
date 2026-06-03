-- =========================================
--  Elfas Design — schema Supabase
--  Cole no SQL editor do projeto Supabase
-- =========================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ================ FUNÇÕES ================

-- Atualiza automaticamente o campo atualizado_em
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

-- ================ TABELAS ================

create table if not exists public.categorias (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  slug        text not null unique,
  criado_em   timestamptz not null default now()
);

create table if not exists public.produtos (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  slug            text not null unique,
  descricao       text default '',
  preco_centavos  integer not null check (preco_centavos > 0),
  vitrine_url     text not null,
  model_url       text,
  zip_url         text,
  cdr_url         text,
  categoria_id    uuid references public.categorias(id) on delete set null,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index if not exists produtos_categoria_idx
  on public.produtos (categoria_id);
create index if not exists produtos_ativo_idx
  on public.produtos (ativo);

create table if not exists public.cupons (
  id          uuid primary key default uuid_generate_v4(),
  codigo      text not null unique,
  percentual  integer not null check (percentual between 1 and 100),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

create table if not exists public.pedidos (
  id              uuid primary key default uuid_generate_v4(),
  txid            text not null unique,
  cliente_email   text not null,
  cliente_uid     uuid references auth.users(id) on delete set null,
  itens           jsonb not null,
  total_centavos  integer not null check (total_centavos >= 0),
  status          text not null check (status in ('pendente','pago','expirado','cancelado')) default 'pendente',
  expira_em       timestamptz,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index if not exists pedidos_status_idx
  on public.pedidos (status);

-- ================ TRIGGERS ================

create trigger set_updated_at
  before update on public.produtos
  for each row execute function public.handle_updated_at();

create trigger set_updated_at
  before update on public.pedidos
  for each row execute function public.handle_updated_at();

-- ================ RLS ================

alter table public.produtos    enable row level security;
alter table public.categorias  enable row level security;
alter table public.cupons      enable row level security;
alter table public.pedidos     enable row level security;

-- Leitura pública de produtos ativos
create policy "produtos_public_read" on public.produtos
  for select using (ativo = true);

-- Leitura pública de categorias
create policy "categorias_public_read" on public.categorias
  for select using (true);

-- Leitura de cupom por código (anon) — para aplicar no checkout
create policy "cupons_public_read" on public.cupons
  for select using (ativo = true);

-- Sem políticas de escrita para anon.
-- O backend usa a service_role_key para tudo (admin, pix, uploads).

-- ================ STORAGE ================

-- Crie manualmente no painel: Storage → New bucket
-- Nome: artstore-bucket
-- Public: SIM
-- Policies:
--   Allow public read: bucket_id = 'artstore-bucket' AND operation = 'SELECT'
--   Allow authenticated insert: bucket_id = 'artstore-bucket' AND operation = 'INSERT'
--   Allow authenticated delete: bucket_id = 'artstore-bucket' AND operation = 'DELETE'
