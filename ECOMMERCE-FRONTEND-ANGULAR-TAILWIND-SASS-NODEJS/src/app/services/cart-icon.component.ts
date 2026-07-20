import { Component } from '@angular/core';
import { CartService } from '@services/cart.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Iproduto } from '@interfaces/iproduto'



@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <fa-icon [icon]="['fas', 'shopping-cart']"></fa-icon>
    <span>{{ items.length }}</span>
  `
})
export class CartIconComponent {
  items: any[] = [];

  constructor(private cartService: CartService) {}

  addToCart(produto: Iproduto) {
    this.cartService.addItem(produto);

   } 
  }