import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@footer/footer.component';
import { MatToolbar } from '@angular/material/toolbar';
import { HeaderComponent } from './header/header.component';
import { CookieBannerComponent } from './cookie-banner/cookie-banner.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookieBannerComponent, HeaderComponent, FooterComponent, MatToolbar],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  protected readonly title = signal('ecommerce');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Carrega o VLibras só no navegador (evita erro no SSR)
    if (isPlatformBrowser(this.platformId)) {
      const script = document.createElement('script');
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.onload = () => {
        try {
          new (window as any).VLibras.Widget('https://vlibras.gov.br/app');
        } catch (e) {
          console.error('Falha ao iniciar o VLibras', e);
        }
      };
      document.body.appendChild(script);
    }
  }
}
