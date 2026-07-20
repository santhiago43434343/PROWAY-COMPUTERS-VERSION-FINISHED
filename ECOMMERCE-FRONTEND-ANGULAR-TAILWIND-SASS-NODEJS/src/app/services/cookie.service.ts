import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Preferências de consentimento de cookies (LGPD). */
export interface ConsentimentoCookies {
  necessarios: true;   // sempre ativos (essenciais) — não dá pra desligar
  analiticos: boolean;
  marketing: boolean;
  data: string;        // quando o usuário decidiu (ISO)
  versao: number;      // versão da política aceita (pra re-perguntar se mudar)
}

/**
 * CookieService
 * - métodos genéricos de cookie (set/get/delete) com guarda de SSR
 * - lógica de CONSENTIMENTO LGPD num lugar só (fonte única da verdade)
 * - `consentimento` é um signal reativo que o app pode observar
 */
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly CONSENT_KEY = 'consentimentoCookies';
  private readonly VERSAO_POLITICA = 1;

  /** Consentimento atual (null = usuário ainda não decidiu). */
  readonly consentimento = signal<ConsentimentoCookies | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.consentimento.set(this.obterConsentimento());
    }
  }

  // ---------- Cookies genéricos ----------

  /** Cria ou atualiza um cookie. */
  set(name: string, value: string, days: number = 7): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  /** Lê um cookie pelo nome. */
  get(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const found = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return found ? decodeURIComponent(found.split('=')[1]) : null;
  }

  /** Apaga um cookie. */
  delete(name: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  }

  /** Retorna todos os cookies como objeto. */
  getAll(): { [key: string]: string } {
    if (!isPlatformBrowser(this.platformId)) return {};
    return document.cookie.split('; ').reduce((acc: any, cookie) => {
      const [key, value] = cookie.split('=');
      if (key) acc[key] = decodeURIComponent(value ?? '');
      return acc;
    }, {});
  }

  // ---------- Consentimento (LGPD) ----------

  /** True se o usuário já decidiu, na versão atual da política. */
  temConsentimento(): boolean {
    const c = this.obterConsentimento();
    return !!c && c.versao === this.VERSAO_POLITICA;
  }

  /** Lê e valida o consentimento salvo. */
  obterConsentimento(): ConsentimentoCookies | null {
    const bruto = this.get(this.CONSENT_KEY);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto) as ConsentimentoCookies;
    } catch {
      return null;
    }
  }

  /** Salva a escolha (180 dias), atualiza o signal e aplica os efeitos. */
  salvarConsentimento(prefs: { analiticos: boolean; marketing: boolean }): void {
    const consent: ConsentimentoCookies = {
      necessarios: true,
      analiticos: prefs.analiticos,
      marketing: prefs.marketing,
      data: new Date().toISOString(),
      versao: this.VERSAO_POLITICA,
    };
    this.set(this.CONSENT_KEY, JSON.stringify(consent), 180);
    this.consentimento.set(consent);
    this.aplicarConsentimento(consent);
  }

  /**
   * Ponto ÚNICO pra ligar/desligar scripts conforme o consentimento.
   * Ex.: só carregar Google Analytics se `analiticos` for true.
   */
  private aplicarConsentimento(c: ConsentimentoCookies): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // if (c.analiticos) { /* carregar Google Analytics aqui */ }
    // if (c.marketing)  { /* carregar pixels de marketing aqui */ }
  }
}
