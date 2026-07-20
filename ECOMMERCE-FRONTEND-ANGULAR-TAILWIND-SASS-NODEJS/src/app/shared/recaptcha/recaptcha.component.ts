import { Component, EventEmitter, Output, Inject, PLATFORM_ID, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

declare const grecaptcha: any;

@Component({
  selector: 'app-recaptcha',
  standalone: true,
  template: '<div #box></div>'
})
export class RecaptchaComponent implements AfterViewInit {
  @ViewChild('box', { static: true }) box!: ElementRef;
  @Output() resolved = new EventEmitter<string | null>();

  // Só renderiza se a site key estiver configurada (vazia = reCAPTCHA desligado)
  readonly habilitado = !!environment.recaptchaSiteKey;
  private widgetId: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!this.habilitado || !isPlatformBrowser(this.platformId)) return;
    this.carregarScript().then(() => this.renderizar());
  }

  private carregarScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof grecaptcha !== 'undefined' && grecaptcha.render) { resolve(); return; }
      const existente = document.getElementById('recaptcha-api');
      if (existente) { existente.addEventListener('load', () => resolve()); return; }
      const s = document.createElement('script');
      s.id = 'recaptcha-api';
      s.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      document.body.appendChild(s);
    });
  }

  private renderizar(): void {
    const tentar = () => {
      if (typeof grecaptcha === 'undefined' || !grecaptcha.render) { setTimeout(tentar, 200); return; }
      this.widgetId = grecaptcha.render(this.box.nativeElement, {
        sitekey: environment.recaptchaSiteKey,
        callback: (token: string) => this.resolved.emit(token),
        'expired-callback': () => this.resolved.emit(null)
      });
    };
    tentar();
  }

  // Limpa o desafio (usar após uma tentativa de login que falhou)
  reset(): void {
    if (this.widgetId !== null && typeof grecaptcha !== 'undefined') {
      grecaptcha.reset(this.widgetId);
      this.resolved.emit(null);
    }
  }
}
