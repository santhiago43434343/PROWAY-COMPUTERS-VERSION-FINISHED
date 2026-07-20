import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trabalhe-conosco.component',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './trabalhe-conosco.component.html',
  styleUrl: './trabalhe-conosco.component.css',
})
export class TrabalheConoscoComponent {
  arquivoSelecionado: File | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      this.arquivoSelecionado = file;
      console.log('Currículo selecionado:', file.name);
    } else {
      alert('Por favor, selecione apenas arquivos em formato PDF.');
    }
  }
}
