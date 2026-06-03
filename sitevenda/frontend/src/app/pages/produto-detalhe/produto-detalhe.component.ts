import { Component, Input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';
import { CartService } from '../../services/cart.service';
import { ModelViewerComponent } from '../../components/model-viewer/model-viewer.component';

interface Produto {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  preco_centavos: number;
  vitrine_url: string;
  model_url: string | null;
  categoria: string;
}

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [CurrencyPipe, ModelViewerComponent],
  template: `
    @if (produto(); as p) {
      <section
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-12
          grid grid-cols-1 lg:grid-cols-2
          gap-10"
      >
        <div>
          <app-model-viewer
            [modelUrl]="p.model_url"
            [alt]="p.nome"
          />
        </div>

        <div>
          <span class="badge-amber">
            {{ p.categoria }}
          </span>
          <h1
            class="heading-display
              mt-3 text-4xl"
          >
            {{ p.nome }}
          </h1>
          <p
            class="mt-4
              text-amber-100/70
              text-lg"
          >
            {{ p.descricao }}
          </p>
          <p
            class="mt-6
              text-amber-400
              font-bold text-3xl"
          >
            {{ p.preco_centavos / 100 | currency: 'BRL' }}
          </p>

          <button
            type="button"
            class="btn-primary mt-8 w-full sm:w-auto"
            (click)="adicionar(p)"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </section>
    } @else if (loading()) {
      <p
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-12 text-amber-100/60"
      >
        Carregando…
      </p>
    } @else {
      <p
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-12 text-amber-100/60"
      >
        Produto não encontrado.
      </p>
    }
  `,
})
export class ProdutoDetalheComponent {
  @Input() slug!: string;

  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly produto = signal<Produto | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  adicionar(p: Produto): void {
    this.cart.add({
      id: p.id,
      slug: p.slug,
      nome: p.nome,
      preco_centavos: p.preco_centavos,
      vitrine_url: p.vitrine_url,
    });
    this.toast.show({
      type: 'success',
      title: 'Adicionado',
      message: `${p.nome} foi para o carrinho.`,
    });
  }

  private async load(): Promise<void> {
    try {
      const p = await this.http
        .get<Produto>(
          `${environment.apiBaseUrl}/produtos/${this.slug}`
        )
        .toPromise();
      this.produto.set(p ?? null);
    } catch {
      this.toast.show({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível carregar o produto.',
      });
    } finally {
      this.loading.set(false);
    }
  }
}
