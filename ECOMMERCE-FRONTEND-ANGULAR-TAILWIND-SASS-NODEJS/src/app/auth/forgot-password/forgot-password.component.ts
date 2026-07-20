import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  email = '';
  carregando = false;
  mensagem = '';
  erro = '';

  constructor(private auth: AuthService) {}

  enviar(): void {
    this.mensagem = '';
    this.erro = '';
    this.carregando = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagem = 'Se o e-mail estiver cadastrado, enviamos as instruções. Confira sua caixa de entrada.';
      },
      error: () => {
        this.carregando = false;
        this.erro = 'Não foi possível enviar agora. Tente novamente em instantes.';
      }
    });
  }
}
