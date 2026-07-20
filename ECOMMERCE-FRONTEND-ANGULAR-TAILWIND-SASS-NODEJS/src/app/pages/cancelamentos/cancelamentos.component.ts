import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CancelamentoService, Reserva } from '../../services/cancelamentos.services';

@Component({
  selector: 'app-cancelamentos',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cancelamentos.component.html',
  styleUrls: ['./cancelamentos.component.scss'],
})
export class CancelamentosComponent {
  // Estado da tela
  codigoReserva: string = '';
  reservaEncontrada: Reserva | null = null;
  mensagemErro: string = '';
  carregando: boolean = false;

  constructor(private cancelamentoService: CancelamentoService) { }

  // Busca os dados no Rails -> MariaDB
  buscarReserva() {
    if (!this.codigoReserva.trim()) {
      this.mensagemErro = 'Por favor, digite um código válido.';
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.reservaEncontrada = null;

    this.cancelamentoService.buscarReserva(this.codigoReserva).subscribe({
      next: (dados: Reserva) => {
        this.reservaEncontrada = dados;
        this.carregando = false;
      },
      error: (err: any) => {
        this.mensagemErro = 'Reserva não encontrada em nossa base de dados.';
        this.carregando = false;
      }
    });
  }

  // Executa o cancelamento real
  confirmarCancelamento() {
    if (!this.reservaEncontrada) return;

    const confirmou = confirm(`Deseja cancelar a passagem de ${this.reservaEncontrada.passageiro}?`);

    if (confirmou) {
      this.cancelamentoService.solicitarCancelamento(this.reservaEncontrada.id, 'Cancelamento via portal').subscribe({
        next: () => {
          alert('Cancelamento realizado com sucesso! O estorno será processado.');
          this.reservaEncontrada = null;
          this.codigoReserva = '';
        },
        error: () => {
          alert('Erro ao processar o cancelamento no servidor.');
        }
      });
    }
  }
}