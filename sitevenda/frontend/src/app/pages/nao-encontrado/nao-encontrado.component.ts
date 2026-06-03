import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="max-w-2xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-24 text-center"
    >
      <p
        class="text-9xl
          font-display font-extrabold
          text-amber-500/30"
      >
        404
      </p>
      <h1
        class="heading-display
          text-3xl mt-4"
      >
        Página não encontrada
      </h1>
      <p class="mt-3 text-amber-100/60">
        A rota que você procura não existe ou foi movida.
      </p>
      <a routerLink="/" class="btn-primary mt-8 inline-block">
        Voltar ao início
      </a>
    </section>
  `,
})
export class NaoEncontradoComponent {}
