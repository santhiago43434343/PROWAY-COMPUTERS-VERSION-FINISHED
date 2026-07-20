import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-confirmar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmar-email.component.html'
})
export class ConfirmarEmailComponent implements OnInit {
  estado: 'carregando' | 'ok' | 'erro' = 'carregando';
  mensagem = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.estado = 'erro';
      this.mensagem = 'Link inválido (sem token).';
      return;
    }

    const params = new HttpParams().set('confirmation_token', token);
    this.http.get<any>(`${environment.apiUrl}/confirmation`, { params }).subscribe({
      next: (res) => {
        this.estado = 'ok';
        this.mensagem = res?.message || 'E-mail confirmado com sucesso!';
      },
      error: (e) => {
        this.estado = 'erro';
        this.mensagem = e?.error?.errors?.[0] || 'Não foi possível confirmar. O link pode ter expirado.';
      }
    });
  }
}
