import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-step-complete',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './step-complete.component.html',
  styleUrls: ['./step-complete.component.scss']
})
export class StepCompleteComponent {
  @Input() rastreio: string | null = null;
  @Input() statusPedido: string | null = null;
  
  // Entradas para o PIX
  @Input() paymentMethod: string = '';
  @Input() pixCode: string = '';
  @Input() pixQrBase64: string | null = null;

  // 🚀 NOVA Entrada para o Mercado Pago
  @Input() urlPagamento: string | null = null;

  copiarPix(input: HTMLInputElement) {
    input.select();
    input.setSelectionRange(0, 99999); 

    navigator.clipboard.writeText(input.value).then(() => {
      alert('✅ Código PIX copiado com sucesso!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  }
}