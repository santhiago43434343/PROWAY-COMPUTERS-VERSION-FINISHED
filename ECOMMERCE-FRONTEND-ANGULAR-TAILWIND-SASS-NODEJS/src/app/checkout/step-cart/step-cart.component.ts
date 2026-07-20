import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IprodutoCarrinho } from '@interfaces/iproduto-carrinho';
import { ZoomOnClickDirective } from '@app/directives/zoom-on-click.directive';

@Component({
  selector: 'app-step-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, ZoomOnClickDirective],
  templateUrl: './step-cart.component.html',
  styleUrls: ['./step-cart.component.scss']
})
export class StepCartComponent {
  @Input() cart: IprodutoCarrinho[] = [];
  @Output() cartData = new EventEmitter<IprodutoCarrinho[]>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>(); // ✅ novo evento

  removerItem(index: number): void {
    this.cart.splice(index, 1);
    this.cartData.emit(this.cart);
  }

  get total(): number {
    return this.cart.reduce((acc, item) => acc + item.preco * (item.quantidadeSelecionada || 1), 0);
  }

  goNext(): void {
    this.cartData.emit(this.cart);
    this.next.emit();
  }

  goBack(): void {
  this.back.emit();
  }
}

