import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // POST /login -> token JWT no header "Authorization"; dados do usuário no corpo
  login(email: string, password: string, recaptchaToken?: string): Observable<HttpResponse<any>> {
    return this.http
      .post<any>(`${this.apiUrl}/login`,
        { user: { email, password }, recaptcha_token: recaptchaToken },
        { observe: 'response' })
      .pipe(tap(resp => {
        this.salvarTokenDoHeader(resp);
        this.salvarUsuario(resp);
      }));
  }

  signup(name: string, email: string, password: string): Observable<HttpResponse<any>> {
    return this.http
      .post<any>(`${this.apiUrl}/signup`, { user: { name, email, password } }, { observe: 'response' })
      .pipe(tap(resp => this.salvarTokenDoHeader(resp)));
  }

  logout(): Observable<any> {
    const req = this.http.delete(`${this.apiUrl}/logout`);
    this.limparSessao();
    return req;
  }

  // POST /password -> envia e-mail com link de redefinição
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password`, { user: { email } });
  }

  // PUT /password -> redefine a senha usando o token recebido por e-mail
  resetPassword(token: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, {
      user: {
        reset_password_token: token,
        password,
        password_confirmation: passwordConfirmation
      }
    });
  }

  // PUT /account/password -> troca de senha do usuário logado (requer token)
  changePassword(currentPassword: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/account/password`, {
      user: {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation
      }
    });
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Dados do usuário logado (id, nome, email) — salvos no login
  getUsuario(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  private salvarUsuario(resp: HttpResponse<any>): void {
    const usuario = resp.body?.user;
    if (usuario && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
    }
  }

  private salvarTokenDoHeader(resp: HttpResponse<any>): void {
    const auth = resp.headers.get('Authorization');
    if (auth && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, auth.replace(/^Bearer\s+/i, ''));
    }
  }

  private limparSessao(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}
