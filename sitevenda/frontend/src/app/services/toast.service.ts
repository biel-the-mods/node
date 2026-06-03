import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastInput {
  type: ToastKind;
  title: string;
  message: string;
  durationMs?: number;
}

export interface ActiveToast extends ToastInput {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<ActiveToast[]>([]);

  show(input: ToastInput): void {
    const id = this.nextId++;
    const duration = input.durationMs ?? 4500;
    const toast: ActiveToast = { id, ...input };

    // Resolvemos o NOVO array FORA do update para respeitar a regra TS1308
    const current = this.toasts();
    const next = [...current, toast];
    this.toasts.set(next);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: number): void {
    const current = this.toasts();
    const next = current.filter((t) => t.id !== id);
    this.toasts.set(next);
  }

  clear(): void {
    this.toasts.set([]);
  }
}
