import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OpcaoFrete {
  servico: string;
  preco: number;
  prazo: number;
}

export interface RespostaFrete {
  opcoes: OpcaoFrete[];
  mock?: boolean;
  erro?: string;
}

export interface EnderecoCep {
  localidade?: string;
  uf?: string;
  bairro?: string;
  logradouro?: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FreteService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Calcula o frete no backend (Melhor Envio ou mock). */
  calcular(cep: string, itens: { preco: number; quantidade: number }[] = []): Observable<RespostaFrete> {
    return this.http.post<RespostaFrete>(`${this.apiUrl}/frete`, { cep, itens });
  }

  /** Busca endereço pelo CEP (ViaCEP, público) — só pra mostrar cidade/UF. */
  buscarEndereco(cep: string): Observable<EnderecoCep> {
    const limpo = (cep || '').replace(/\D/g, '');
    return this.http.get<EnderecoCep>(`https://viacep.com.br/ws/${limpo}/json/`);
  }
}
