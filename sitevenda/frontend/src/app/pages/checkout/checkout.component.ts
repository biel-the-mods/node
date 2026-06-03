import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

interface PixResponse {
  txid: string;
  copia_e_cola: string;
  qr_code_url: string;
  expira_em_segundos: number;
}

interface PixStatus {
  status: 'pendente' | 'pago' | 'expirado';
  txid: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `
    <section
      class="max-w-3xl mx-auto
        px-4 sm:px-6 lg:px-8
        py-12"
    >
      <h1
        class="heading-display
          text-4xl mb-8"
      >
        Pagamento via PIX
      </h1>

      @if (!pix()) {
        <div class="glass p-8 text-center">
          <p class="text-amber-100/60 mb-6">
            Total a pagar:
            <span class="text-amber-400 font-bold text-2xl ml-2">
              {{ cart.totalCentavos() / 100 | currency: 'BRL' }}
            </span>
          </p>
          <button
            type="button"
            class="btn-primary"
            [disabled]="gerando()"
            (click)="gerarPix()"
          >
            {{ gerando() ? 'Gerando…' : 'Gerar PIX' }}
          </button>
        </div>
      } @else {
        <div class="glass-strong p-8 space-y-6">
          <div class="flex items-center justify-between">
            <span class="badge-amber animate-pulse-slow">
              ⏱ {{ formatTimer(segundosRestantes()) }}
            </span>
            <span
              class="text-xs uppercase tracking-widest"
              [class.text-amber-400]="status() === 'pendente'"
              [class.text-emerald-400]="status() === 'pago'"
              [class.text-red-400]="status() === 'expirado'"
            >
              {{ statusLabel() }}
            </span>
          </div>

          @if (status() === 'pendente') {
            <div>
              <label class="label-base">
                PIX Copia e Cola
              </label>
              <div class="flex gap-2">
                <input
                  class="input-base font-mono text-xs"
                  readonly
                  [value]="pix()!.copia_e_cola"
                />
                <button
                  type="button"
                  class="btn-ghost"
                  (click)="copiar()"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div class="text-center">
              <img
                [src]="pix()!.qr_code_url"
                alt="QR Code PIX"
                class="mx-auto w-56 h-56
                  rounded-xl border border-amber-500/30
                  bg-white p-2"
              />
            </div>
          }

          @if (status() === 'pago') {
            <p class="text-emerald-400 text-center font-semibold">
              ✓ Pagamento confirmado! Você receberá os
              arquivos no e-mail cadastrado.
            </p>
            <button class="btn-primary w-full" (click)="voltar()">
              Voltar à loja
            </button>
          }

          @if (status() === 'expirado') {
            <p class="text-red-400 text-center">
              O PIX expirou. Gere um novo código.
            </p>
            <button class="btn-primary w-full" (click)="gerarPix()">
              Gerar novo PIX
            </button>
          }
        </div>
      }
    </section>
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly pix = signal<PixResponse | null>(null);
  readonly status = signal<'pendente' | 'pago' | 'expirado'>(
    'pendente'
  );
  readonly gerando = signal(false);
  readonly segundosRestantes = signal(0);

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.cart.items().length === 0) {
      this.router.navigateByUrl('/vitrine');
    }
  }

  formatTimer(seg: number): string {
    const m = Math.floor(seg / 60)
      .toString()
      .padStart(2, '0');
    const s = (seg % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  statusLabel(): string {
    return this.status() === 'pendente'
      ? 'Aguardando pagamento'
      : this.status() === 'pago'
        ? 'Pago'
        : 'Expirado';
  }

  gerarPix(): void {
    if (this.cart.items().length === 0) return;
    this.gerando.set(true);
    this.stopTimers();

    this.http
      .post<PixResponse>(`${environment.apiBaseUrl}/pix/gerar`, {
        itens: this.cart.items(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.pix.set(resp);
          this.status.set('pendente');
          this.segundosRestantes.set(resp.expira_em_segundos);
          this.gerando.set(false);

          this.startCountdown();
          this.startPolling(resp.txid);
        },
        error: () => {
          this.gerando.set(false);
          this.toast.show({
            type: 'error',
            title: 'Falha ao gerar PIX',
            message: 'Tente novamente em instantes.',
          });
        },
      });
  }

  copiar(): void {
    const p = this.pix();
    if (!p) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(p.copia_e_cola).then(() => {
        this.toast.show({
          type: 'success',
          title: 'Copiado',
          message: 'Código PIX copiado para a área de transferência.',
        });
      });
    }
  }

  voltar(): void {
    this.cart.clear();
    this.router.navigateByUrl('/');
  }

  private startCountdown(): void {
    this.timerHandle = setInterval(() => {
      const next = this.segundosRestantes() - 1;
      if (next <= 0) {
        this.segundosRestantes.set(0);
        this.status.set('expirado');
        this.stopTimers();
        return;
      }
      this.segundosRestantes.set(next);
    }, 1000);
  }

  private startPolling(txid: string): void {
    this.pollHandle = setInterval(() => {
      this.http
        .get<PixStatus>(
          `${environment.apiBaseUrl}/pix/status/${txid}`
        )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (s) => {
            if (s.status === 'pago') {
              this.status.set('pago');
              this.stopTimers();
            } else if (s.status === 'expirado') {
              this.status.set('expirado');
              this.stopTimers();
            }
          },
          // silencioso: polling só falha a rede
          error: () => undefined,
        });
    }, environment.pix.pollIntervalMs);
  }

  private stopTimers(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.timerHandle = null;
    this.pollHandle = null;
  }
}
