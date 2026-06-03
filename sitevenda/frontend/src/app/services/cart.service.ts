import { Injectable, computed, signal } from '@angular/core';

export interface CartItem {
  id: string;
  slug: string;
  nome: string;
  preco_centavos: number;
  vitrine_url: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'elfas.cart';

  readonly items = signal<CartItem[]>(this.loadFromStorage());

  readonly totalCentavos = computed(() =>
    this.items().reduce((sum, i) => sum + i.preco_centavos, 0)
  );

  readonly count = computed(() => this.items().length);

  add(item: CartItem): void {
    // Resolve o novo array FORA do .update() para respeitar a regra TS1308
    const current = this.items();
    const next = [...current, item];
    this.items.set(next);
    this.persist(next);
  }

  remove(id: string): void {
    const current = this.items();
    const next = current.filter((i) => i.id !== id);
    this.items.set(next);
    this.persist(next);
  }

  clear(): void {
    this.items.set([]);
    this.persist([]);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(this.STORAGE_KEY)
          : null;
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // localStorage indisponível: não quebra o app
    }
  }
}
