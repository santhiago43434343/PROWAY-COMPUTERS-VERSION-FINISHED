import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { RecaptchaComponent } from '../../shared/recaptcha/recaptcha.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RecaptchaComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email = '';
  senha = '';
  carregando = false;
  erro = '';
  mostrarSenha = false;   // olhinho: alterna o input entre 'password' e 'text'

  captchaToken: string | null = null;
  readonly recaptchaAtivo = !!environment.recaptchaSiteKey;

  @ViewChild(RecaptchaComponent) recaptcha?: RecaptchaComponent;

  private returnUrl = '/home';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
  }

  entrar(): void {
    this.erro = '';

    if (this.recaptchaAtivo && !this.captchaToken) {
      this.erro = 'Confirme que você não é um robô.';
      return;
    }

    this.carregando = true;
    this.auth.login(this.email, this.senha, this.captchaToken || undefined).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (e) => {
        this.carregando = false;
        // mostra a mensagem do backend (ex.: "confirme seu e-mail" / "falha no reCAPTCHA")
        this.erro = e?.error?.error || e?.error?.errors?.[0] || 'E-mail ou senha inválidos.';
        this.captchaToken = null;
        this.recaptcha?.reset();
      }
    });
  }
}
