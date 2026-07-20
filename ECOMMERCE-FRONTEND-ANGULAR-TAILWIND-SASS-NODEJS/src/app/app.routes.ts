import { Routes } from '@angular/router';
import { provideRouter, withHashLocation } from '@angular/router';
import { environment } from '../environments/environment';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'cadastro',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  {
    path: 'confirmar-email',
    loadComponent: () => import('./auth/confirmar-email/confirmar-email.component').then(m => m.ConfirmarEmailComponent)
  },

  {
    path: 'trocar-senha',
    canActivate: [authGuard],
    loadComponent: () => import('./auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },

  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout-page/checkout-page.component').then(m => m.CheckoutPageComponent)
  },

  {
    path: 'checkout-retorno',
    loadComponent: () => import('./pages/checkout-retorno/checkout-retorno.component').then(m => m.CheckoutRetornoComponent)
  },

  {
    path: 'meus-pedidos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/meus-pedidos/meus-pedidos.component').then(m => m.MeusPedidosComponent)
  },

  {
    path: 'produtos',
    loadComponent: () => import('./produtos/produtos.component').then(m => m.ProdutosComponent)
  },

  {
    path: 'produtos/:descricao',
    loadComponent: () => import('./produtos/produtos.component').then(m => m.ProdutosComponent)
  },

  {
    path: 'produto/:id',
    loadComponent: () => import('./produtos/detalhes-produto/detalhes-produto.component').then(m => m.DetalhesProdutoComponent)
  },

  {
    path: 'carrinho',
    loadComponent: () => import('./carrinho/carrinho.component').then(m => m.CarrinhoComponent)
  },

  {
    path: 'servidores',
    loadComponent: () => import('./servidores/servidores.component').then(m => m.ServidoresComponent)
  },

  {
    path: 'contato',
    loadComponent: () => import('./contato/contato.component').then(m => m.ContatoComponent)
  },

  {
    path: 'politica-privacidade',
    loadComponent: () => import('./pages/politica-privacidade/politica-privacidade.component').then(m => m.PoliticaPrivacidadeComponent)
  },

  {
    path: '404',
    loadComponent: () => import('./pages/nao-encontrado/nao-encontrado.component').then(m => m.NaoEncontradoComponent)
  },

  {
    path: '**',
    loadComponent: () => import('./pages/nao-encontrado/nao-encontrado.component').then(m => m.NaoEncontradoComponent)
  }
];

export const router = provideRouter(
  routes,
  ...(environment.useHash ? [withHashLocation()] : [])
);
