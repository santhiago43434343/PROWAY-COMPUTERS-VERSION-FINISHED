import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  // Em dev, environment.apiUrl = '/api' passa pelo proxy -> /api/v1
  private readonly apiUrl: string = `${environment.apiUrl}/checkouts`;

  constructor(private http: HttpClient) {}

  // POST - Criar
  finalizarPedido(orderData: any): Observable<any> {
    const nomesProdutos = (orderData.cart || [])
      .map((p: any) => `${p.quantidade}x ${p.nome}`)
      .join(', ');

    const payload = {
      checkout: {
        total: Number(orderData.total) || 0,
        user_id: orderData.user_id ?? null,
        status: 'pendente',
        cart: nomesProdutos,
        emailCliente: orderData.email || '',
        address: `${orderData.address?.rua}, ${orderData.address?.numero}`,
        delivery: orderData.delivery?.nome,
        payment: orderData.payment?.metodo
      }
    };
    return this.http.post<any>(this.apiUrl, payload);
  }

  // GET - Listar
  listarPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // PUT - Atualizar
  atualizarPedido(id: number, novosDados: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { checkout: novosDados });
  }

  // DELETE - Excluir
  excluirPedido(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // POST - Cancelar pedido pendente
  cancelarPedido(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
