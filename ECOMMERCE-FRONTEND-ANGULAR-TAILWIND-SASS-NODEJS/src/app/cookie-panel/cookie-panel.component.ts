import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from '@app/services/cookie.service';

/**
 * CookiePanelComponent — modal de preferências (3 categorias).
 * - Necessários: sempre ativos (não editável)
 * - Analíticos / Marketing: o usuário liga/desliga
 * Emite `salvar` (após gravar) e `fechar`.
 */
@Component({
  selector: 'app-cookie-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cookie-panel.component.html',
  styleUrls: ['./cookie-panel.component.scss']
})
export class CookiePanelComponent {
  @Output() salvar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();

  analiticos = false;
  marketing = false;

  constructor(private cookieService: CookieService) {
    // pré-preenche com a escolha anterior, se existir
    const atual = this.cookieService.obterConsentimento();
    if (atual) {
      this.analiticos = atual.analiticos;
      this.marketing = atual.marketing;
    }
  }

  aceitarTudo(): void {
    this.analiticos = true;
    this.marketing = true;
    this.salvarPreferencias();
  }

  recusar(): void {
    this.analiticos = false;
    this.marketing = false;
    this.salvarPreferencias();
  }

  salvarPreferencias(): void {
    this.cookieService.salvarConsentimento({
      analiticos: this.analiticos,
      marketing: this.marketing
    });
    this.salvar.emit();
  }

  fecharPainel(): void {
    this.fechar.emit();
  }
}
