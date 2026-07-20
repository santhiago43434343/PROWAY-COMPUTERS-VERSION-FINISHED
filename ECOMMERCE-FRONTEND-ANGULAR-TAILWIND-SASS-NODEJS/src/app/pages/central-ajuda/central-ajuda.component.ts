import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-central-ajuda',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './central-ajuda.component.html',
  styleUrl: './central-ajuda.component.scss',
})
export class CentralAjudaComponent {

  // Adicione a função aqui também
  direcionarParaWhatsapp() {
    const telefone = "5513991889820";
    const mensagem = "Olá! Gostaria de ajuda com o projeto TRIP-BUS-NATIONAL.";
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }
}

