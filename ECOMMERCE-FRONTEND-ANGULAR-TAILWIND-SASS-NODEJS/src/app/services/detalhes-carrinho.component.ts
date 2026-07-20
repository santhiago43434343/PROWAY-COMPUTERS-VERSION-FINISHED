import { Component } from '@angular/core';
import { CartService } from '@services/cart.service';
import { Iproduto } from '@interfaces/iproduto';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalhes-carrinho',
  imports: [CurrencyPipe, CommonModule],
  standalone: true,
  template: `
    <h2>Detalhes do Carrinho</h2>
    <ul>
      <li *ngFor="let item of items">
        {{ item.nome }} - {{ item.preco | currency:'BRL' }}
      </li>
    </ul>
  `
})
export class DetalhesCarrinhoComponent {
  items: Iproduto[] = [];

  constructor(private cartService: CartService) {
    this.cartService.items$.subscribe(data => {
      this.items = data;
    });
  }
}
