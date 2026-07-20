import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  senhaAtual = '';
  novaSenha = '';
  confirmacao = '';
  carregando = false;
  erro = '';
  mensagem = '';
  mostrarSenha = false;   // olhinho: alterna os campos de senha entre 'password' e 'text'

  constructor(private auth: AuthService) {}

  alterar(): void {
    this.erro = '';
    this.mensagem = '';
    if (this.novaSenha !== this.confirmacao) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.carregando = true;
    this.auth.changePassword(this.senhaAtual, this.novaSenha, this.confirmacao).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagem = 'Senha alterada com sucesso.';
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmacao = '';
      },
      error: (e) => {
        this.carregando = false;
        this.erro = e?.error?.errors?.[0] || 'Não foi possível alterar a senha. Confira a senha atual.';
      }
    });
  }
}
