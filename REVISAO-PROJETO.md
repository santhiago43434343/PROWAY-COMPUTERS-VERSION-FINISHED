# Revisão do Projeto — E-commerce (Rails + Angular)

**Data:** 17/06/2026
**Escopo:** organização, arquitetura, bugs e segurança (backend Rails + frontend Angular)

## Visão geral

Full-stack: **backend Ruby on Rails 7** (API REST) + **frontend Angular 20** (SSR + Tailwind), PostgreSQL e Docker Compose. Pagamentos via MercadoPago, PayPal e PIX. A loja é "ProwayComputers" (servidores/hardware).

**Veredito:** protótipo funcional, **não pronto para produção**. A base é boa e moderna, mas há falhas graves de segurança no fluxo de pagamento e vários bugs/duplicações que precisam ser resolvidos antes de qualquer deploy real.

---

## 🔴 CRÍTICO — Segurança

1. **Nenhuma autenticação/autorização.** O `CheckoutsController` expõe `index` (lista **todos** os pedidos de todos os clientes), `update` e `destroy` por ID, sem login. Quem tiver a URL lê, altera e apaga pedidos de qualquer um.
   `backend/app/controllers/api/v1/checkouts_controller.rb`

2. **Qualquer um marca pedido como "pago" sem pagar.** A ação `update` (linha 77) aceita `status: 'pago'` direto do request e ainda dispara o e-mail de confirmação. Falha de lógica de negócio crítica.

3. **Webhook do PayPal sem verificação de assinatura.** `paypal_webhook` (linha 59) confia 100% no corpo do request — um POST forjado com `event_type=PAYMENT.CAPTURE.COMPLETED` + um `custom_id` marca qualquer pedido como pago. (O webhook do MercadoPago é melhor: ele consulta a API do MP para confirmar o status.)

4. **Senha do banco hardcoded em arquivos versionados.** `Vermelho@0010203040` aparece em `config/database.yml` (linha 24) e em `docker-compose.yml` (linhas 5 e 18). Esses arquivos **não** estão no `.gitignore` → a senha está no repositório/histórico do git. (O `master.key` em si está corretamente ignorado — esse ponto está OK.)

5. **Token do MercadoPago hardcoded em 3 lugares.** `TEST-2302...` em `checkouts_controller.rb` (linhas 39 e 114) e em `mercado_pago_service.rb` (linha 6), inclusive como fallback de `ENV['MP_ACCESS_TOKEN'] || 'TOKEN'`. É token de teste, mas o padrão vaza o token e arrisca commitar o de produção do mesmo jeito.

6. **Dados de cartão em texto puro no front.** `step-payment.component.ts` coleta `numero`, `validade`, `cvv` num objeto comum. Capturar PAN/CVV diretamente é problema de PCI-DSS; cartão deve usar tokenização do gateway (MP/PayPal/Stripe), nunca trafegar pelo seu backend.

7. **CORS restrito só a dev.** Libera apenas `localhost:4200` com `credentials: true`. Falta a origem de produção; revisar antes do deploy.
   `backend/config/initializers/cors.rb`

---

## 🟠 BUGS importantes

1. **Valor do pedido fixo em R$ 150.** `CheckoutComponent.orderData.total = 150` (linha 36) e o PayPal com `amount.value = '150.00'` (`step-payment`, linha 60). O total não vem do carrinho — todo pedido sai 150.

2. **Método de pagamento não é capturado direito.** `checkout.component.ts setPayment()` lê `event.method`, mas o `StepPayment` emite `{ metodo: ... }` (em português). `event.method` é `undefined` → cai no fallback e grava o objeto inteiro em `payment`.

3. **Rota `force_sucess` sem ação.** `routes.rb` declara `post :force_sucess`, mas não existe o método no controller → rota quebrada / erro 500 se chamada (além do typo "sucess").

4. **PIX é falso.** `gerar_pix_estatico` devolve um código placeholder fixo (`"00020126360014BR.GOV.BCB.PIX..."`); o front gera o QR a partir dele (api.qrserver.com). Não é um PIX pagável.

5. **URLs da API inconsistentes e hardcoded.** Três jeitos de chamar o backend: `PedidoService` usa `127.0.0.1:3000`, `CheckoutComponent` usa `localhost:3000` (inline, sem usar o service), `CancelamentosService` usa `localhost:3000/api/v1`. Nenhum usa `environment.apiUrl`/proxy de forma consistente.

6. **Produção não conecta na API.** `environment.prod.ts` tem `apiUrl: ''` e o deploy é GitHub Pages (estático). O Rails não roda no GH Pages → o checkout não funciona em produção.

7. **`notification_url` aponta para ngrok.** URL temporária (`combinative-rita-...ngrok-free.dev`) hardcoded; expira e quebra o webhook do MP.

8. **`Order` sem validações.** `order.rb` está com as validações comentadas ("para testar se o 422 some"), com `belongs_to :user, optional: true` e `user_id = 1` fixo no controller. Pedidos salvam sem total/endereço/itens.

---

## 🟡 ARQUITETURA / qualidade

1. **Modelos e tabelas duplicados: `Pedido` vs `Order`.** Existem migrations para `pedidos` e `orders` e dois models. O código usa `Order`; `Pedido` (com `serialize :cart`) parece órfão. Confusão PT/EN.

2. **Dois carrinhos: `CartService` vs `CarrinhoService`.** Um em memória (sem persistência, perde no reload), outro em localStorage, com interfaces diferentes (`Iproduto` vs `IprodutoCarrinho`). Escolher um.

3. **Lógica de criar pedido duplicada.** `PedidoService.finalizarPedido()` existe, mas o `CheckoutComponent` o ignora e faz o `http.post` inline. Os dois caminhos divergem (formato do `cart`: string `"2x Mouse"` vs `JSON.stringify`).

4. **`MercadoPagoService` morto/divergente.** Usa `pedido.total_price` (o model usa `total`) e `back_urls` diferentes do que o controller faz inline — provavelmente código morto.

5. **Lógica do PayPal duplicada** em `step-payment` e `step-review`; e o container `#paypal-button-container` está comentado no `step-payment` (lá não renderiza).

6. **SSR + GitHub Pages não combinam.** O projeto tem SSR (Angular + Express) mas faz deploy estático no GH Pages. Decidir: SSR num host Node, ou SPA estático puro.

---

## 🧹 ORGANIZAÇÃO / limpeza

**Backend** (soltos na raiz do projeto, fora de `backend/`):
- Lixo/stub (1 linha ou vazios): `=`, `ls`, `reading`, `[internal]` — parecem saída de comando redirecionada por engano (ex.: `algo > =`). Pode apagar.
- Duplicados/fora do lugar: `gemfile` (minúsculo), `config.ru`, `development.rb`, `checkouts_controller.rb` (stub) — os de verdade estão dentro de `backend/`.
- `pedido.service.ts` — arquivo **TypeScript** dentro do projeto Ruby (veio do front).
- `pgdata/` — diretório de dados do Postgres no repo; use só o volume do Docker.

**Frontend** (soltos na raiz, duplicando os de `src/app/`):
- `checkout.service.ts`, `pedido.service.ts`, `app-routes.ts`, `checkout-page.component.html`, `header.component.html`, `step-review.component.ts`.
- `dist/` e `docs/` (build do GH Pages) versionados — o script `deploy` commita `dist/`. Builds não vão pro git.
- `*.Zone.Identifier` em `src/assets/img/` — metadados do Windows (mark-of-the-web). Lixo, apagar.
- Cache `.angular/` (1,3 GB) — não versionar (adicionar ao `.gitignore`).
- `cancelamentos.services.ts` — nome com typo (`.services.` no plural).
- URLs cruas da Dell/Lenovo no `servidores.component.html` (linhas 45–79) — conferir se é conteúdo ou sobra.

---

## ✅ Pontos positivos

- `.gitignore` do Rails cobre corretamente `*.key`, `.env*`, `storage`, `log`, `tmp`.
- Usa `credentials.yml.enc` (padrão Rails) e variáveis de ambiente com fallback no `database.yml`.
- O webhook do MercadoPago confirma o status consultando a API do MP (não confia cegamente no request).
- Stack moderna (Rails 7, Angular 20, SSR, Docker Compose) e checkout dividido em steps — boa base para evoluir.
- CORS configurado explicitamente em vez de liberar geral.

---

## Próximos passos sugeridos (em ordem de prioridade)

1. **Rotacionar segredos:** trocar a senha do banco (ela está no histórico do git) e mover tudo para variáveis de ambiente / `credentials.yml.enc`.
2. **Autenticação:** adicionar login (ex.: Devise + JWT) e proteger as rotas; `index` deve filtrar pelo usuário dono.
3. **Não confiar no cliente para "pago":** remover a opção de setar `status=pago` via `update`; validar a assinatura do webhook do PayPal; manter a confirmação sempre server-side.
4. **Total real:** calcular o total a partir do carrinho (de preferência no servidor) e remover os `150` fixos.
5. **Unificar:** um model de pedido (`Order`), um carrinho, um caminho de criação de pedido, uma estratégia de `apiUrl` (environment + proxy).
6. **Limpar o repo:** remover lixo/builds/duplicados e ajustar o `.gitignore` (`.angular`, `dist`, `docs`, `pgdata`).
7. **Acertar pendências:** corrigir `force_sucess`, implementar PIX de verdade, trocar a URL do ngrok por uma estável.
