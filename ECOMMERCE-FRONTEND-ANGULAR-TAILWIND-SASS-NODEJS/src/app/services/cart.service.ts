import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iproduto } from '@interfaces/iproduto';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = new BehaviorSubject<Iproduto[]>([]);
  items$ = this.items.asObservable();

  addItem(produto: Iproduto) {
    const atual = this.items.value;
    this.items.next([...atual, produto]);
  }

  getItems(): Iproduto[] {
    return this.items.value;
  }

  clearCart() {
    this.items.next([]);
  }
}
