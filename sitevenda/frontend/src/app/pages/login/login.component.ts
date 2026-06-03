import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section
      class="max-w-md mx-auto
        px-4 sm:px-6 lg:px-8
        py-16"
    >
      <div class="glass-strong p-8 space-y-6">
        <h1
          class="heading-display
            text-3xl text-center"
        >
          Entrar
        </h1>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="label-base">E-mail</label>
            <input
              class="input-base"
              type="email"
              required
              [(ngModel)]="email"
              name="email"
              autocomplete="email"
            />
          </div>
          <div>
            <label class="label-base">Senha</label>
            <input
              class="input-base"
              type="password"
              required
              minlength="6"
              [(ngModel)]="password"
              name="password"
              autocomplete="current-password"
            />
          </div>
          <button
            type="submit"
            class="btn-primary w-full"
            [disabled]="auth.loading()"
          >
            {{ auth.loading() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>
      </div>
    </section>
  `,
})
export class LoginComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  async onSubmit(): Promise<void> {
    const ok = await this.auth.signIn(this.email, this.password);
    if (ok) this.router.navigateByUrl('/');
  }
}
