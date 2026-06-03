import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative">
      <div
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          py-20 lg:py-32
          flex flex-col items-center text-center"
      >
        <span class="badge-amber animate-pulse-slow">
          ✦ Novo drop disponível
        </span>

        <h1
          class="heading-display
            mt-6
            text-5xl sm:text-6xl lg:text-7xl
            max-w-4xl"
        >
          Mockups digitais
          <span
            class="block
              bg-gradient-to-r
              from-amber-300 via-amber-500 to-amber-300
              bg-clip-text text-transparent"
          >
            em 3D
          </span>
        </h1>

        <p
          class="mt-6
            max-w-2xl
            text-lg text-amber-100/70"
        >
          Camisetas interativas, visualização realista
          e entrega digital instantânea via PIX.
          Por Elfas.
        </p>

        <div class="mt-10 flex flex-wrap gap-4 justify-center">
          <a routerLink="/vitrine" class="btn-primary">
            Ver Vitrine
          </a>
          <a routerLink="/vitrine" class="btn-ghost">
            Lançamentos
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {}
