import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-checkout-retorno',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-retorno.component.html'
})
export class CheckoutRetornoComponent implements OnInit {
  status = '';        // approved | pending | in_process | rejected | ...
  pedidoId = '';
  paymentId = '';
  rastreio = '';
  confirmando = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private carrinho: CarrinhoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    this.status    = q.get('status') || q.get('collection_status') || '';
    this.pedidoId  = q.get('external_reference') || '';
    this.paymentId = q.get('payment_id') || q.get('collection_id') || '';

    if (this.aprovado && isPlatformBrowser(this.platformId)) {
      this.carrinho.limparCarrinho();
      try { localStorage.removeItem('checkout_state'); } catch { /* noop */ }
      this.rastreio = this.pedidoId ? `PED-${this.pedidoId}` : '';
      this.confirmarPagamento();
    }
  }

  // Confirma no backend (que valida no Mercado Pago) -> marca como pago + dispara e-mail
  private confirmarPagamento(): void {
    if (!this.paymentId) return;
    this.confirmando = true;
    this.http.post<any>(`${environment.apiUrl}/checkouts/confirmar`, { payment_id: this.paymentId }).subscribe({
      next: (res) => {
        this.confirmando = false;
        if (res?.pedido_id) this.pedidoId = String(res.pedido_id);
        if (res?.rastreio) this.rastreio = res.rastreio;
      },
      error: () => { this.confirmando = false; }
    });
  }

  get aprovado(): boolean { return this.status === 'approved'; }
  get pendente(): boolean { return this.status === 'pending' || this.status === 'in_process'; }
  get recusado(): boolean { return !this.aprovado && !this.pendente; }
}
