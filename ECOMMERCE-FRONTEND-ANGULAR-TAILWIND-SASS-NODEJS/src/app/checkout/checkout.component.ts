import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CarrinhoService } from '../services/carrinho.service';

// Componentes dos Steps
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { StepCartComponent } from './step-cart/step-cart.component';
import { StepAddressComponent } from './step-address/step-address.component';
import { StepDeliveryComponent } from './step-delivery/step-delivery.component';
import { StepPaymentComponent } from './step-payment/step-payment.component';
import { StepReviewComponent } from './step-review/step-review.component';
import { StepCompleteComponent } from './step-complete/step-complete.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarComponent,
    StepCartComponent,
    StepAddressComponent,
    StepDeliveryComponent,
    StepPaymentComponent,
    StepReviewComponent,
    StepCompleteComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: []
})
export class CheckoutComponent implements OnInit {
  currentStep = 1;

  orderData: any = {
    total: 0,
    user_id: null,
    status: 'pendente',
    emailCliente: '',
    address: {},
    cart: [] as any[],
    delivery: {},
    payment: ''
  };

  constructor(
    private http: HttpClient,
    private carrinhoService: CarrinhoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.orderData.cart = this.carrinhoService.obterCarrinho() || [];
      this.recalcularTotal();
    }
  }

  // Total calculado a partir do carrinho (preco * quantidade)
  recalcularTotal(): void {
    const itens: any[] = this.orderData.cart || [];
    this.orderData.total = itens.reduce(
      (acc, item) => acc + (Number(item.preco) || 0) * (Number(item.quantidade) || 1),
      0
    );
  }

  setCart(cart: any[]) {
    this.orderData.cart = cart || [];
    this.recalcularTotal();
  }

  setAddress(event: any) {
    this.orderData.address = event;
    this.currentStep = 3;
  }

  setDelivery(event: any) {
    this.orderData.delivery = event;
    this.currentStep = 4;
  }

  setPayment(event: any) {
    // StepPayment emite { metodo, dados }
    this.orderData.payment = event?.metodo ?? event;
    this.currentStep = 5;
  }

  // Cria o pedido no backend (Rails)
  finalizarPedido() {
    const payload = {
      checkout: {
        total: this.orderData.total,
        user_id: this.orderData.user_id,
        status: 'pendente',
        payment: this.orderData.payment,
        emailCliente: this.orderData.emailCliente,
        address: JSON.stringify(this.orderData.address),
        cart: JSON.stringify(this.orderData.cart),
        delivery: JSON.stringify(this.orderData.delivery)
      }
    };

    this.http.post<any>(`${environment.apiUrl}/checkouts`, payload).subscribe({
      next: (res) => {
        // Mercado Pago retorna a URL de pagamento -> redireciona
        if (res.url_pagamento) {
          if (isPlatformBrowser(this.platformId)) {
            window.location.href = res.url_pagamento;
          }
        } else {
          this.currentStep = 6;
        }
      },
      error: (err) => {
        console.error('Erro ao finalizar:', err);
        alert('Erro ao processar o pedido no servidor.');
      }
    });
  }

  goToStep(step: number) {
    this.currentStep = step;
  }
}
