import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';

export interface AppUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly toast = inject(ToastService);

  readonly user = signal<AppUser | null>(null);
  readonly loading = signal(false);

  async restoreSession(): Promise<void> {
    this.loading.set(true);
    try {
      const { data } = await this.supabase.client.auth.getUser();
      if (!data.user) return;

      // Resolvemos o objeto FORA do .update() para respeitar a regra TS1308
      const profile: AppUser = {
        id: data.user.id,
        email: data.user.email ?? '',
        role:
          (data.user.app_metadata?.['role'] as 'customer' | 'admin') ??
          'customer',
      };
      this.user.set(profile);
    } catch {
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    try {
      const { data, error } =
        await this.supabase.client.auth.signInWithPassword({
          email,
          password,
        });
      if (error) {
        this.toast.show({
          type: 'error',
          title: 'Falha no login',
          message: error.message,
        });
        return false;
      }
      if (!data.user) return false;

      const profile: AppUser = {
        id: data.user.id,
        email: data.user.email ?? '',
        role:
          (data.user.app_metadata?.['role'] as 'customer' | 'admin') ??
          'customer',
      };
      this.user.set(profile);

      this.toast.show({
        type: 'success',
        title: 'Bem-vindo de volta',
        message: `Olá, ${profile.email}.`,
      });
      return true;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.user.set(null);
  }
}
