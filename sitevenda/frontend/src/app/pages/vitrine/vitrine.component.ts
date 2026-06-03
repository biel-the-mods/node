import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

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
  selector: 'app-vitrine',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="max-w-7xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-12"
    >
      <header class="mb-10">
        <h1
          class="heading-display
            text-4xl sm:text-5xl"
        >
          Vitrine
        </h1>
        <p class="mt-2 text-amber-100/60">
          Mockups digitais de alto padrão. Entrega via download.
        </p>
      </header>

      @if (loading()) {
        <p class="text-amber-100/60">Carregando produtos…</p>
      } @else if (produtos().length === 0) {
        <p class="text-amber-100/60">
          Nenhum produto disponível ainda.
        </p>
      } @else {
        <div
          class="grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6"
        >
          @for (p of produtos(); track p.id) {
            <a
              [routerLink]="['/produto', p.slug]"
              class="glass
                overflow-hidden
                hover:border-amber-500/50
                hover:shadow-glow
                transition-all duration-300
                group"
            >
              <div
                class="aspect-square
                  overflow-hidden
                  bg-charcoal-900"
              >
                <img
                  [src]="p.vitrine_url"
                  [alt]="p.nome"
                  class="w-full h-full object-cover
                    group-hover:scale-105
                    transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div class="p-5">
                <span class="badge-amber">
                  {{ p.categoria }}
                </span>
                <h2
                  class="mt-3
                    heading-display text-lg
                    tracking-wide"
                >
                  {{ p.nome }}
                </h2>
                <p
                  class="mt-2
                    text-amber-100/60 text-sm
                    line-clamp-2"
                >
                  {{ p.descricao }}
                </p>
                <p
                  class="mt-4
                    text-amber-400
                    font-semibold text-lg"
                >
                  {{ formatBRL(p.preco_centavos) }}
                </p>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class VitrineComponent {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  readonly produtos = signal<Produto[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.load();
  }

  formatBRL(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private async load(): Promise<void> {
    try {
      const data = await this.http
        .get<Produto[]>(`${environment.apiBaseUrl}/produtos`)
        .toPromise();
      this.produtos.set(data ?? []);
    } catch {
      this.toast.show({
        type: 'error',
        title: 'Falha ao carregar',
        message: 'Não foi possível listar os produtos.',
      });
    } finally {
      this.loading.set(false);
    }
  }
}
