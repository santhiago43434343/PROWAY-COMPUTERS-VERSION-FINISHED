import { Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieService } from '@services/cookie.service';
import { CookiePanelComponent } from '@app/cookie-panel/cookie-panel.component';

/**
 * CookieBannerComponent — orquestra o consentimento LGPD:
 * - barra inicial (só na 1ª visita / enquanto não houver decisão)
 * - botão flutuante (sempre) que reabre as preferências
 * - abre o modal (cookie-panel) ao "Personalizar"
 * Só renderiza no navegador (afterNextRender) pra não quebrar o SSR/hidratação.
 */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [RouterLink, CookiePanelComponent],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent {
  pronto = false;          // só vira true no navegador
  mostrarBanner = false;   // barra de consentimento (1ª visita)
  mostrarPainel = false;   // modal de preferências

  constructor(private cookieService: CookieService) {
    afterNextRender(() => {
      this.pronto = true;
      this.mostrarBanner = !this.cookieService.temConsentimento();
    });
  }

  aceitarTudo(): void {
    this.cookieService.salvarConsentimento({ analiticos: true, marketing: true });
    this.fecharTudo();
  }

  recusar(): void {
    this.cookieService.salvarConsentimento({ analiticos: false, marketing: false });
    this.fecharTudo();
  }

  abrirPreferencias(): void {
    this.mostrarPainel = true;
  }

  /** chamado pelo modal quando o usuário salva */
  aoSalvar(): void {
    this.fecharTudo();
  }

  private fecharTudo(): void {
    this.mostrarBanner = false;
    this.mostrarPainel = false;
  }
}
