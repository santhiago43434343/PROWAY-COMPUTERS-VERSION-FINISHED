import { Component, Output, EventEmitter, AfterViewChecked, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const paypal: any;

@Component({
  selector: 'app-step-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-payment.component.html',
  styleUrls: ['./step-payment.component.scss']
})
export class StepPaymentComponent implements OnInit, AfterViewChecked {
  // Recebe dados persistidos caso o usuário volte um step
  @Input() initialPaymentData: any;
  // Total do pedido (vem do carrinho) — usado pelo PayPal
  @Input() total: number = 0;

  @Output() paymentData = new EventEmitter<any>();
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  // Definimos Mercado Pago como padrão para facilitar seus testes atuais
  metodoSelecionado: string = 'mercadopago';
  dadosPagamento: any = {
    numero: '',
    validade: '',
    cvv: '',
    chave: ''
  };

  paypalRendered = false;

  ngOnInit(): void {
    // Recupera dados se o usuário estiver voltando da Revisão para o Pagamento
    if (this.initialPaymentData) {
      this.metodoSelecionado = this.initialPaymentData.metodo || 'mercadopago';
      this.dadosPagamento = { ...this.initialPaymentData.dados };
    }
  }

  ngAfterViewChecked() {
    const element = document.getElementById('paypal-button-container');

    if (this.metodoSelecionado === 'paypal' && !this.paypalRendered && element) {
      if (typeof paypal === 'undefined') {
        console.error('PayPal SDK não encontrado no index.html');
        return;
      }

      try {
        this.paypalRendered = true; // Trava para não renderizar múltiplos botões

        paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: (this.total || 0).toFixed(2) } // valor real do carrinho
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              this.paymentData.emit({ metodo: 'paypal', dados: details });
              this.next.emit();
            });
          },
          onError: (err: any) => {
            console.error('Erro no fluxo do PayPal:', err);
            this.paypalRendered = false;
          }
        }).render('#paypal-button-container');
      } catch (e) {
        console.error("Falha ao carregar botões do PayPal", e);
        this.paypalRendered = false;
      }
    }
  }

  /**
   * Chamado pelos botões de 'Continuar' (Cartão, Pix e Mercado Pago)
   */
  continuar() {
    if (!this.metodoSelecionado) {
      alert('Por favor, selecione um método de pagamento.');
      return;
    }

    this.paymentData.emit({
      metodo: this.metodoSelecionado,
      dados: this.metodoSelecionado === 'cartao' ? this.dadosPagamento : {}
    });

    this.next.emit();
  }

  goBack() {
    this.back.emit();
  }
}
