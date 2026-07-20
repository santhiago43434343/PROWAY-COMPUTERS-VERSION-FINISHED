import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IprodutoCarrinho } from '@interfaces/iproduto-carrinho';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private itens: IprodutoCarrinho[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Adiciona produto sem salvar no localStorage
  adicionarProduto(produto: IprodutoCarrinho): void {
    this.itens.push(produto);
  }

  // Recupera carrinho do localStorage
  obterCarrinho(): IprodutoCarrinho[] {
    if (isPlatformBrowser(this.platformId)) {
      const carrinho = localStorage.getItem('carrinho');
      this.itens = carrinho ? JSON.parse(carrinho) : [];
    }
    return this.itens;
  }

  // Adiciona produto e salva no localStorage
  adicionarAoCarrinho(produto: IprodutoCarrinho): void {
    this.itens.push(produto);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrinho', JSON.stringify(this.itens));
    }
  }

  // Remove produto pelo ID
  removerProdutoCarrinho(produtoId: number): void {
    this.itens = this.itens.filter(item => item.id !== produtoId);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('carrinho', JSON.stringify(this.itens));
    }
  }

  // Limpa carrinho
  limparCarrinho(): void {
    this.itens = [];
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('carrinho');
    }
  }
}
