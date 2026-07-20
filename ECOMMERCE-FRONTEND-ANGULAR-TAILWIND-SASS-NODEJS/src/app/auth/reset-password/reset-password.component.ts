import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  senha = '';
  confirmacao = '';
  carregando = false;
  erro = '';
  sucesso = false;
  mostrarSenha = false;   // olhinho: alterna os campos de senha entre 'password' e 'text'

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  redefinir(): void {
    this.erro = '';
    if (!this.token) {
      this.erro = 'Link inválido ou sem token. Solicite a redefinição novamente.';
      return;
    }
    if (this.senha !== this.confirmacao) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.carregando = true;
    this.auth.resetPassword(this.token, this.senha, this.confirmacao).subscribe({
      next: () => {
        this.carregando = false;
        this.sucesso = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (e) => {
        this.carregando = false;
        this.erro = e?.error?.errors?.[0] || 'Não foi possível redefinir. O link pode ter expirado.';
      }
    });
  }
}
