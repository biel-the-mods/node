import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

interface Categoria {
  id: string;
  nome: string;
  slug: string;
}
interface Cupom {
  id: string;
  codigo: string;
  percentual: number;
  ativo: boolean;
}
interface Pedido {
  id: string;
  cliente_email: string;
  total_centavos: number;
  status: string;
  criado_em: string;
}

type Tab = 'produtos' | 'categorias' | 'cupons' | 'pedidos';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section
      class="max-w-7xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-12"
    >
      <header class="mb-8">
        <h1
          class="heading-display
            text-4xl"
        >
          Painel Admin
        </h1>
        <p class="mt-2 text-amber-100/60">
          Gestão de produtos, categorias, cupons e pedidos.
        </p>
      </header>

      <nav class="flex flex-wrap gap-2 mb-8">
        @for (t of tabs; track t) {
          <button
            type="button"
            class="px-4 py-2 rounded-lg
              text-sm font-semibold uppercase
              tracking-widest transition-colors"
            [class.bg-amber-500]="tab() === t"
            [class.text-charcoal-950]="tab() === t"
            [class.text-amber-100\\/70]="tab() !== t"
            [class.hover:bg-amber-500\\/10]="tab() !== t"
            (click)="tab.set(t)"
          >
            {{ t }}
          </button>
        }
      </nav>

      @switch (tab()) {
        @case ('produtos') {
          <form
            class="glass p-6 space-y-4"
            (ngSubmit)="uploadProduto($event)"
          >
            <h2 class="heading-display text-2xl">
              Novo produto
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label-base">Nome</label>
                <input class="input-base" name="nome" [(ngModel)]="novoProduto.nome" required />
              </div>
              <div>
                <label class="label-base">Slug</label>
                <input class="input-base" name="slug" [(ngModel)]="novoProduto.slug" required />
              </div>
              <div class="sm:col-span-2">
                <label class="label-base">Descrição</label>
                <textarea
                  class="input-base"
                  rows="3"
                  name="descricao"
                  [(ngModel)]="novoProduto.descricao"
                ></textarea>
              </div>
              <div>
                <label class="label-base">Preço (centavos)</label>
                <input
                  class="input-base"
                  type="number"
                  min="1"
                  name="preco"
                  [(ngModel)]="novoProduto.preco_centavos"
                  required
                />
              </div>
              <div>
                <label class="label-base">Categoria (slug)</label>
                <input
                  class="input-base"
                  name="categoria"
                  [(ngModel)]="novoProduto.categoria_slug"
                />
              </div>
              <div>
                <label class="label-base">Imagem Vitrine</label>
                <input
                  class="input-base"
                  type="file"
                  accept="image/*"
                  name="vitrine"
                  (change)="onVitrine($event)"
                  required
                />
              </div>
              <div>
                <label class="label-base">Arquivo 3D (.glb/.gltf)</label>
                <input
                  class="input-base"
                  type="file"
                  accept=".glb,.gltf"
                  name="modelo"
                  (change)="onModelo($event)"
                />
              </div>
              <div>
                <label class="label-base">ZIP de Entrega</label>
                <input
                  class="input-base"
                  type="file"
                  accept=".zip"
                  name="zip"
                  (change)="onZip($event)"
                />
              </div>
              <div>
                <label class="label-base">CDR de Entrega</label>
                <input
                  class="input-base"
                  type="file"
                  accept=".cdr"
                  name="cdr"
                  (change)="onCdr($event)"
                />
              </div>
            </div>
            <button class="btn-primary" type="submit">
              Publicar produto
            </button>
          </form>
        }
        @case ('categorias') {
          <form
            class="glass p-6 space-y-4"
            (ngSubmit)="criarCategoria()"
          >
            <h2 class="heading-display text-2xl">
              Nova categoria
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label-base">Nome</label>
                <input class="input-base" [(ngModel)]="novaCategoria.nome" name="cat-nome" required />
              </div>
              <div>
                <label class="label-base">Slug</label>
                <input class="input-base" [(ngModel)]="novaCategoria.slug" name="cat-slug" required />
              </div>
            </div>
            <button class="btn-primary" type="submit">
              Criar categoria
            </button>
          </form>
        }
        @case ('cupons') {
          <form
            class="glass p-6 space-y-4"
            (ngSubmit)="criarCupom()"
          >
            <h2 class="heading-display text-2xl">
              Novo cupom
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label-base">Código</label>
                <input class="input-base" [(ngModel)]="novoCupom.codigo" name="cupom-codigo" required />
              </div>
              <div>
                <label class="label-base">Percentual</label>
                <input
                  class="input-base"
                  type="number"
                  min="1"
                  max="100"
                  [(ngModel)]="novoCupom.percentual"
                  name="cupom-percentual"
                  required
                />
              </div>
            </div>
            <button class="btn-primary" type="submit">
              Criar cupom
            </button>
          </form>
        }
        @case ('pedidos') {
          <div class="glass p-6">
            <h2 class="heading-display text-2xl mb-4">
              Pedidos recentes
            </h2>
            @if (pedidos().length === 0) {
              <p class="text-amber-100/60">
                Nenhum pedido registrado.
              </p>
            } @else {
              <ul class="divide-y divide-amber-500/10">
                @for (p of pedidos(); track p.id) {
                  <li
                    class="py-3
                      flex items-center justify-between
                      text-sm"
                  >
                    <div>
                      <p class="text-amber-50 font-semibold">
                        {{ p.cliente_email }}
                      </p>
                      <p class="text-amber-100/50 text-xs">
                        {{ p.criado_em }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-amber-400 font-semibold">
                        {{ p.total_centavos / 100 | currency: 'BRL' }}
                      </p>
                      <p class="text-xs uppercase tracking-widest text-amber-100/60">
                        {{ p.status }}
                      </p>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        }
      }
    </section>
  `,
})
export class AdminComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly tabs: Tab[] = ['produtos', 'categorias', 'cupons', 'pedidos'];
  readonly tab = signal<Tab>('produtos');
  readonly pedidos = signal<Pedido[]>([]);

  novoProduto = {
    nome: '',
    slug: '',
    descricao: '',
    preco_centavos: 0,
    categoria_slug: '',
  };
  private vitrine: File | null = null;
  private modelo: File | null = null;
  private zip: File | null = null;
  private cdr: File | null = null;

  novaCategoria = { nome: '', slug: '' };
  novoCupom = { codigo: '', percentual: 10 };

  constructor() {
    this.loadPedidos();
  }

  onVitrine(e: Event): void {
    this.vitrine = (e.target as HTMLInputElement).files?.[0] ?? null;
  }
  onModelo(e: Event): void {
    this.modelo = (e.target as HTMLInputElement).files?.[0] ?? null;
  }
  onZip(e: Event): void {
    this.zip = (e.target as HTMLInputElement).files?.[0] ?? null;
  }
  onCdr(e: Event): void {
    this.cdr = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  uploadProduto(e: Event): void {
    e.preventDefault();
    if (!this.vitrine) {
      this.toast.show({
        type: 'warning',
        title: 'Imagem obrigatória',
        message: 'Selecione a imagem de vitrine.',
      });
      return;
    }
    const fd = new FormData();
    fd.append('nome', this.novoProduto.nome);
    fd.append('slug', this.novoProduto.slug);
    fd.append('descricao', this.novoProduto.descricao);
    fd.append('preco_centavos', String(this.novoProduto.preco_centavos));
    fd.append('categoria_slug', this.novoProduto.categoria_slug);
    fd.append('vitrine', this.vitrine);
    if (this.modelo) fd.append('modelo', this.modelo);
    if (this.zip) fd.append('zip', this.zip);
    if (this.cdr) fd.append('cdr', this.cdr);

    this.http
      .post(`${environment.apiBaseUrl}/admin/produtos`, fd)
      .subscribe({
        next: () => {
          this.toast.show({
            type: 'success',
            title: 'Produto publicado',
            message: `${this.novoProduto.nome} já está na vitrine.`,
          });
        },
      });
  }

  criarCategoria(): void {
    this.http
      .post(`${environment.apiBaseUrl}/admin/categorias`, this.novaCategoria)
      .subscribe({
        next: () => {
          this.toast.show({
            type: 'success',
            title: 'Categoria criada',
            message: this.novaCategoria.nome,
          });
          this.novaCategoria = { nome: '', slug: '' };
        },
      });
  }

  criarCupom(): void {
    this.http
      .post(`${environment.apiBaseUrl}/admin/cupons`, this.novoCupom)
      .subscribe({
        next: () => {
          this.toast.show({
            type: 'success',
            title: 'Cupom criado',
            message: this.novoCupom.codigo,
          });
          this.novoCupom = { codigo: '', percentual: 10 };
        },
      });
  }

  private loadPedidos(): void {
    this.http
      .get<Pedido[]>(`${environment.apiBaseUrl}/admin/pedidos`)
      .subscribe({
        next: (p) => this.pedidos.set(p),
        error: () => this.pedidos.set([]),
      });
  }
}
