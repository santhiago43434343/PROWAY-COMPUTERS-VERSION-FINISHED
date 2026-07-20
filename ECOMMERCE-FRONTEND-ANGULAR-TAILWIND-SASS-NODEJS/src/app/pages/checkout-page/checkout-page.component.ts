import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CarrinhoService } from '../../services/carrinho.service';

// Componentes de Step
import { ProgressBarComponent } from '../../checkout/progress-bar/progress-bar.component';
import { StepCartComponent } from '../../checkout/step-cart/step-cart.component';
import { StepAddressComponent } from '../../checkout/step-address/step-address.component';
import { StepPaymentComponent } from '../../checkout/step-payment/step-payment.component';
import { StepReviewComponent } from '../../checkout/step-review/step-review.component';
import { StepCompleteComponent } from '../../checkout/step-complete/step-complete.component';

const STORAGE_KEY = 'checkout_state';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ProgressBarComponent, StepCartComponent, StepAddressComponent,
    StepPaymentComponent, StepReviewComponent, StepCompleteComponent
  ],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  currentStep = 1;
  maxStep = 1;            // etapa mais avançada já alcançada (para retomar nela)
  rastreio: string | null = null;
  statusPedido: string | null = null;
  isLoading = false;

  urlPagamento: string | null = null;
  paymentMethod: string = '';
  pixCode: string = '';
  pixQrBase64: string | null = null;
  pixPaymentId: string | number | null = null;
  private pixPoll: any = null;

  // Banner "Gostaria de continuar sua compra?"
  mostrarRetomar = false;
  private estadoSalvo: any = null;

  orderData: any = {
    total: 0,
    cart: [],
    address: {},
    delivery: {},
    payment: { metodo: 'pix' },
    emailCliente: ''
  };

  constructor(
    private http: HttpClient,
    private carrinhoService: CarrinhoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.orderData.cart = this.carrinhoService.obterCarrinho() || [];
    // Frete escolhido no carrinho (Melhor Envio) — substitui a etapa manual de transportadora
    const freteSalvo = this.lerFreteCarrinho();
    if (freteSalvo) this.orderData.delivery = freteSalvo;
    this.recalcularTotal();

    // Se houver um checkout em andamento salvo, oferece retomar
    const salvo = this.lerEstado();
    const etapaSalva = salvo ? (salvo.maxStep || salvo.currentStep || 1) : 1;
    if (salvo && (etapaSalva > 1 || this.temDadosPreenchidos(salvo.orderData))) {
      this.estadoSalvo = salvo;
      this.mostrarRetomar = true;
    }
  }

  private temDadosPreenchidos(od: any): boolean {
    if (!od) return false;
    return !!(od.address?.rua || od.delivery?.nome || od.emailCliente);
  }

  continuarCompra(): void {
    if (this.estadoSalvo) {
      this.orderData = { ...this.orderData, ...this.estadoSalvo.orderData };
      // mantém o carrinho atual como fonte da verdade
      this.orderData.cart = this.carrinhoService.obterCarrinho() || this.orderData.cart || [];
      this.recalcularTotal();
      // retoma na etapa mais avançada que o usuário alcançou
      this.maxStep = this.estadoSalvo.maxStep || this.estadoSalvo.currentStep || 1;
      this.currentStep = this.maxStep;
    }
    this.mostrarRetomar = false;
    this.scrollTopo();
  }

  recomecarCompra(): void {
    this.limparEstado();
    this.orderData = {
      total: 0,
      cart: this.carrinhoService.obterCarrinho() || [],
      address: {},
      delivery: {},
      payment: { metodo: 'pix' },
      emailCliente: ''
    };
    this.recalcularTotal();
    this.currentStep = 1;
    this.maxStep = 1;
    this.mostrarRetomar = false;
  }

  recalcularTotal(): void {
    const itens: any[] = this.orderData.cart || [];
    const subtotal = itens.reduce(
      (acc, item) => acc + (Number(item.preco) || 0) * (Number(item.quantidadeSelecionada) || 1),
      0
    );
    const frete = Number(this.orderData.delivery?.valor) || 0;
    this.orderData.total = subtotal + frete;
  }

  setCart(cart: any[]): void {
    this.orderData.cart = cart || [];
    this.recalcularTotal();
    this.salvarEstado();
  }

  goToStep(step: number): void {
    this.currentStep = step;
    this.maxStep = Math.max(this.maxStep, step); // nunca "esquece" o ponto mais avançado
    this.salvarEstado();
    this.scrollTopo();
  }

  finishOrder(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const payload = {
      checkout: {
        total: this.orderData.total,
        status: 'pendente',
        user_id: null, // backend associa ao usuário logado (current_user)
        emailCliente: this.orderData.emailCliente,
        address: JSON.stringify(this.orderData.address),
        cart: JSON.stringify(this.orderData.cart),
        delivery: JSON.stringify(this.orderData.delivery),
        payment: this.orderData.payment?.metodo || 'pix'
      }
    };

    this.http.post<any>(`${environment.apiUrl}/checkouts`, payload).subscribe({
      next: (res) => {
        this.paymentMethod = payload.checkout.payment;
        this.urlPagamento = res.url_pagamento || null;
        this.pixCode = res.pix_copia_e_cola || '';
        this.pixQrBase64 = res.pix_qr_base64 || null;
        this.pixPaymentId = res.pix_payment_id || null;

        // Pedido criado: descarta o rascunho salvo
        this.limparEstado();

        if (this.paymentMethod === 'mercadopago' && this.urlPagamento) {
          if (isPlatformBrowser(this.platformId)) window.location.href = this.urlPagamento;
          return;
        }

        this.rastreio = res.id ? `PED-${res.id}` : 'BR-GERANDO';
        this.statusPedido = res.status || 'pendente';
        this.carrinhoService.limparCarrinho();
        this.limparFreteCarrinho();
        this.currentStep = 5;
        this.scrollTopo();

        // PIX: consulta o status até o Mercado Pago aprovar
        if (this.paymentMethod === 'pix' && this.pixPaymentId) {
          this.iniciarPollingPix();
        }
      },
      error: (err) => {
        console.error('Erro:', err);
        alert('Erro ao processar o pedido.');
        this.isLoading = false;
      }
    });
  }

  // ---------- Persistência (localStorage) ----------
  private salvarEstado(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentStep: this.currentStep,
        maxStep: this.maxStep,
        orderData: this.orderData
      }));
    } catch { /* ignora cota/erros de storage */ }
  }

  private lerEstado(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  private limparEstado(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }

  private lerFreteCarrinho(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const f = localStorage.getItem('frete_checkout');
      return f ? JSON.parse(f) : null;
    } catch {
      return null;
    }
  }

  private limparFreteCarrinho(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.removeItem('frete_checkout'); } catch { /* noop */ }
  }

  private scrollTopo(): void {
    if (isPlatformBrowser(this.platformId)) window.scrollTo(0, 0);
  }

  // Consulta o status do PIX a cada 5s até o Mercado Pago aprovar.
  private iniciarPollingPix(): void {
    if (!isPlatformBrowser(this.platformId) || !this.pixPaymentId) return;
    let tentativas = 0;
    this.pixPoll = setInterval(() => {
      if (++tentativas > 40) { this.pararPollingPix(); return; } // para após ~3 min
      this.http.post<any>(`${environment.apiUrl}/checkouts/confirmar`, { payment_id: this.pixPaymentId })
        .subscribe({
          next: (res) => {
            if (res?.status === 'pago') {
              this.statusPedido = 'pago';
              if (res.rastreio) this.rastreio = res.rastreio;
              this.pararPollingPix();
            }
          },
          error: () => { /* mantém tentando */ }
        });
    }, 5000);
  }

  private pararPollingPix(): void {
    if (this.pixPoll) { clearInterval(this.pixPoll); this.pixPoll = null; }
  }

  ngOnDestroy(): void {
    this.pararPollingPix();
  }
}
