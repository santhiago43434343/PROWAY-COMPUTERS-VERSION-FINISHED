import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reserva {
  id: number;
  passageiro: string;
  origem: string;
  destino: string;
  dataViagem: string;
}

@Injectable({ providedIn: 'root' })
export class CancelamentoService {
  // NOTA: este serviço parece código legado (de um projeto de reservas/viagens) e
  // aponta para rotas /cancelamentos que NÃO existem no backend atual. Mantido apenas
  // com a URL unificada; avalie remover se não for usado.
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarReserva(codigo: string): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.API_URL}/cancelamentos/${codigo}`);
  }

  solicitarCancelamento(id: number, motivo: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/cancelamentos/${id}`, {
      body: { motivo }
    });
  }
}
