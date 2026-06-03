import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="fixed top-20 right-4 z-50
        flex flex-col gap-3
        w-[min(420px,calc(100vw-2rem))]"
      aria-live="polite"
    >
      @for (t of toast.toasts(); track t.id) {
        <div
          class="glass-strong
            px-4 py-3
            flex items-start gap-3
            animate-pulse-slow"
          [class.border-amber-500\\/60]="t.type === 'success'"
        >
          <span
            class="mt-0.5 inline-flex items-center
              justify-center w-8 h-8 rounded-full
              bg-amber-500/20 text-amber-400
              text-sm font-bold"
          >
            {{ iconFor(t.type) }}
          </span>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-semibold
                uppercase tracking-wider
                text-amber-50"
            >
              {{ t.title }}
            </p>
            <p
              class="mt-1 text-sm
                text-amber-100/80
                break-words"
            >
              {{ t.message }}
            </p>
          </div>
          <button
            type="button"
            class="text-amber-100/40
              hover:text-amber-300
              text-lg leading-none"
            (click)="toast.dismiss(t.id)"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);

  protected iconFor(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      case 'warning':
        return '⚠';
      default:
        return 'i';
    }
  }
}
