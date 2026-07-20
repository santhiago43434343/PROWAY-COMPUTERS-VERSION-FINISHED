import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() currentStep: number = 1;

  steps = [
    { id: 1, label: 'Carrinho' },
    { id: 2, label: 'Endereço' },
    { id: 3, label: 'Pagamento' },
    { id: 4, label: 'Revisão' },
    { id: 5, label: 'Concluir' }
  ];
}

