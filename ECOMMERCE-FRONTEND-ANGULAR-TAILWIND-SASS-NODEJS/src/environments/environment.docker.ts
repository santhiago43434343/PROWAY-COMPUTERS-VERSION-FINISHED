/* Build para Docker: servido por Nginx, que faz proxy de /api -> Rails */
export const environment = {
  production: true,
  useHash: true,
  baseHref: '/',
  apiUrl: '/api',
  paypalClientId: 'ATgfRj4lnx0FpepVYx0S8-U20YA9qyZGP9Vx7Be260KyGKiLJsPPPda3mfn_Y72Lec-uwpBLvFxOzbR_',
  paypalCurrency: 'BRL',
  // Chave de TESTE oficial do Google (sempre passa, qualquer dominio) — para localhost.
  // Chave REAL (Enterprise, so com verificacao Enterprise): '6LeA6CstAAAAABTN9tC_n46acey8CsDQZiY4k63B'
  recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
};
