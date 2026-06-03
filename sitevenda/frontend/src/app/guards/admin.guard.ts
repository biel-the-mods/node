import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const u = auth.user();
  if (u?.role === 'admin') return true;

  toast.show({
    type: 'warning',
    title: 'Acesso restrito',
    message: 'Você precisa de privilégios de administrador.',
  });
  return router.createUrlTree(['/']);
};
