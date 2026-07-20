import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politica-privacidade',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './politica-privacidade.component.html'
})
export class PoliticaPrivacidadeComponent {
  atualizadoEm = '19/06/2026';
}
