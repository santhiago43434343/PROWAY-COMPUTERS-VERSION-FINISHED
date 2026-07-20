import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

// Anexa o token JWT (Authorization: Bearer ...) SÓ nas chamadas ao nosso backend.
// Evita vazar o token para APIs externas (ex.: ViaCEP) e o erro de CORS que isso causaria.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const ehExterno = req.url.startsWith('http') && !req.url.startsWith(environment.apiUrl);
  const token = inject(AuthService).getToken();

  if (token && !ehExterno) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
