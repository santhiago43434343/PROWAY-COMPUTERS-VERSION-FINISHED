import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  nome = '';
  email = '';
  senha = '';
  confirmacao = '';
  carregando = false;
  erro = '';
  cadastrado = false;
  mostrarSenha = false;   // olhinho: alterna os campos de senha entre 'password' e 'text'

  constructor(private auth: AuthService) {}

  cadastrar(): void {
    this.erro = '';
    if (this.senha !== this.confirmacao) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.carregando = true;
    this.auth.signup(this.nome, this.email, this.senha).subscribe({
      next: () => {
        // Com confirmação de e-mail, o usuário precisa confirmar antes de entrar.
        this.carregando = false;
        this.cadastrado = true;
      },
      error: (e) => {
        this.carregando = false;
        this.erro = e?.error?.errors?.[0] || 'Não foi possível criar a conta. Verifique os dados.';
      }
    });
  }
}
