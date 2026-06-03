import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section
      class="max-w-4xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-12"
    >
      <h1
        class="heading-display
          text-4xl mb-8"
      >
        Carrinho
      </h1>

      @if (cart.items().length === 0) {
        <div class="glass p-10 text-center">
          <p class="text-amber-100/60">
            Seu carrinho está vazio.
          </p>
          <a routerLink="/vitrine" class="btn-primary mt-6 inline-block">
            Explorar Vitrine
          </a>
        </div>
      } @else {
        <ul class="space-y-3">
          @for (item of cart.items(); track item.id) {
            <li
              class="glass
                p-4
                flex items-center gap-4"
            >
              <img
                [src]="item.vitrine_url"
                [alt]="item.nome"
                class="w-20 h-20 object-cover
                  rounded-lg border border-amber-500/20"
              />
              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold
                    text-amber-50
                    truncate"
                >
                  {{ item.nome }}
                </p>
                <p class="text-sm text-amber-400">
                  {{ item.preco_centavos / 100 | currency: 'BRL' }}
                </p>
              </div>
              <button
                type="button"
                class="btn-ghost"
                (click)="cart.remove(item.id)"
              >
                Remover
              </button>
            </li>
          }
        </ul>

        <div
          class="glass-strong
            mt-8 p-6
            flex flex-col sm:flex-row
            items-center justify-between
            gap-4"
        >
          <div>
            <p
              class="text-xs uppercase
                tracking-widest
                text-amber-100/60"
            >
              Total
            </p>
            <p
              class="text-3xl font-bold
                text-amber-400"
            >
              {{ cart.totalCentavos() / 100 | currency: 'BRL' }}
            </p>
          </div>
          <a routerLink="/checkout" class="btn-primary w-full sm:w-auto">
            Finalizar compra
          </a>
        </div>
      }
    </section>
  `,
})
export class CarrinhoComponent {
  protected readonly cart = inject(CartService);
}
