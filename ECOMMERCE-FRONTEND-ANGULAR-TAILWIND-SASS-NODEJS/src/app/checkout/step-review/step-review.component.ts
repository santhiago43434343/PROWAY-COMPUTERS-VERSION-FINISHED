import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { loadScript } from '@paypal/paypal-js';

@Component({
  selector: 'app-step-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-review.component.html',
  styleUrls: ['./step-review.component.scss']
})
export class StepReviewComponent implements AfterViewInit {
  @Input() orderData: any;
  @Output() back = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>(); // mercadopago / pix -> fluxo do checkout-page

  erro: string | null = null;
  processando = false;
  private paypalRenderizado = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get metodo(): string {
    const p = this.orderData?.payment;
    return (p && typeof p === 'object' ? p.metodo : p) || '';
  }

  get total(): number {
    return Number(this.orderData?.total) || 0;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.metodo === 'paypal' && this.total > 0) {
      this.configurarPaypal();
    }
  }

  async configurarPaypal(): Promise<void> {
    if (this.paypalRenderizado) return;

    try {
      const paypal = await loadScript({
        clientId: environment.paypalClientId,
        currency: environment.paypalCurrency
      });

      if (paypal && paypal.Buttons) {
        this.paypalRenderizado = true;
        await paypal.Buttons({
          createOrder: (_data: any, actions: any) =>
            actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                amount: { value: this.total.toFixed(2), currency_code: environment.paypalCurrency }
              }]
            }),
          onApprove: async (data: any) => {
            // A captura é feita no BACKEND (server-side), por segurança.
            // Aqui só enviamos o ID do pedido aprovado no PayPal.
            this.finalizarPaypal(data.orderID);
          },
          onError: (err: any) => {
            console.error('Erro no PayPal:', err);
            this.erro = 'Ocorreu um erro ao processar o PayPal.';
            this.paypalRenderizado = false;
          }
        }).render('#paypal-button-container');
      }
    } catch (e) {
      console.error('Erro ao carregar o PayPal:', e);
      this.erro = 'Não foi possível carregar o PayPal.';
    }
  }

  // Manda o orderID do PayPal pro backend: ele cria o pedido, captura no PayPal e marca pago.
  private finalizarPaypal(paypalOrderId: string): void {
    if (this.processando) return;
    this.processando = true;

    const payload = {
      paypal_order_id: paypalOrderId,
      checkout: {
        total: this.total,
        status: 'pendente',
        user_id: null,
        emailCliente: this.orderData?.emailCliente || '',
        address: JSON.stringify(this.orderData?.address || {}),
        cart: JSON.stringify(this.orderData?.cart || []),
        delivery: JSON.stringify(this.orderData?.delivery || {}),
        payment: 'paypal'
      }
    };

    this.http.post<any>(`${environment.apiUrl}/checkouts/confirmar_paypal`, payload).subscribe({
      next: (res: any) => {
        const id = res?.pedido_id ?? '';
        const aprovado = res?.status === 'pago';
        this.router.navigate(['/checkout-retorno'], {
          queryParams: { status: aprovado ? 'approved' : 'pending', external_reference: id }
        });
      },
      error: () => {
        this.processando = false;
        this.erro = 'Pagamento aprovado no PayPal, mas houve erro ao registrar/capturar o pedido.';
      }
    });
  }

  // Mercado Pago e Pix usam o fluxo padrão do checkout (redirect MP / tela do PIX)
  finalizar(): void {
    this.finish.emit();
  }
}
