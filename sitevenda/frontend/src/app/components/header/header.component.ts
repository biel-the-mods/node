import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-40
        bg-charcoal-950/80 backdrop-blur-lg
        border-b border-amber-500/20"
    >
      <div
        class="max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          h-16 flex items-center justify-between"
      >
        <a
          routerLink="/"
          class="flex items-center gap-2
            text-amber-400 hover:text-amber-300
            transition-colors"
        >
          <span class="text-2xl">🜲</span>
          <span
            class="heading-display text-lg
              tracking-[0.3em]"
          >
            Elfas
          </span>
        </a>

        <nav class="hidden md:flex items-center gap-1">
          <a
            routerLink="/vitrine"
            routerLinkActive="text-amber-300 bg-amber-500/10"
            class="px-4 py-2 rounded-lg
              text-sm font-semibold uppercase
              tracking-widest text-amber-100/70
              hover:text-amber-300 hover:bg-amber-500/10
              transition-colors"
          >
            Vitrine
          </a>
          <a
            routerLink="/carrinho"
            routerLinkActive="text-amber-300 bg-amber-500/10"
            class="px-4 py-2 rounded-lg
              text-sm font-semibold uppercase
              tracking-widest text-amber-100/70
              hover:text-amber-300 hover:bg-amber-500/10
              transition-colors"
          >
            Carrinho
          </a>

          @if (auth.user()?.role === 'admin') {
            <a
              routerLink="/admin"
              routerLinkActive="text-amber-300 bg-amber-500/10"
              class="px-4 py-2 rounded-lg
                text-sm font-semibold uppercase
                tracking-widest text-amber-400
                hover:text-amber-300 hover:bg-amber-500/10
                transition-colors"
            >
              Admin
            </a>
          }
        </nav>

        <div class="flex items-center gap-2">
          @if (auth.user(); as u) {
            <span
              class="hidden sm:inline text-xs
                text-amber-100/60"
            >
              {{ u.email }}
            </span>
            <button class="btn-ghost" (click)="auth.signOut()">
              Sair
            </button>
          } @else {
            <a routerLink="/login" class="btn-ghost">
              Entrar
            </a>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
}
