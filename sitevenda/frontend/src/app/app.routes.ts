import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'vitrine',
    loadComponent: () =>
      import('./pages/vitrine/vitrine.component').then(
        (m) => m.VitrineComponent
      ),
  },
  {
    path: 'produto/:slug',
    loadComponent: () =>
      import('./pages/produto-detalhe/produto-detalhe.component').then(
        (m) => m.ProdutoDetalheComponent
      ),
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./pages/carrinho/carrinho.component').then(
        (m) => m.CarrinhoComponent
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/nao-encontrado/nao-encontrado.component').then(
        (m) => m.NaoEncontradoComponent
      ),
  },
];
