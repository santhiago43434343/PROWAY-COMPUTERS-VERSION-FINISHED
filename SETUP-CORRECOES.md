# Guia de execução das correções

**Data:** 17/06/2026

Este guia explica como ativar tudo que foi alterado. **Importante:** as edições de código já estão aplicadas no diretório, mas eu não consigo rodar `bundle install`, migrations nem `ng` daqui — **você precisa rodar os comandos abaixo no WSL e testar.**

---

## 1. O que mudou (resumo)

**Backend (Rails)**
- Adicionado **Devise + JWT** (login/registro/logout via API).
- `index`, `update`, `destroy` de pedidos agora exigem login (`authenticate_user!`).
- `update` **bloqueia** definir `status = 'pago'` pelo cliente (403). "Pago" só via webhook confirmado.
- Webhook do PayPal agora **valida assinatura** (com `verify_paypal_signature`).
- Token do Mercado Pago, `notification_url`, senha do banco e origens CORS agora vêm de **variáveis de ambiente**.
- `Order` voltou a ter **validações** (total, status, e-mail).
- Removida a rota quebrada `force_sucess`.

**Frontend (Angular)**
- `AuthService` + **interceptor JWT** + **guard** de rota + tela de **login** (`/login`).
- Total do checkout agora vem do **carrinho** (acabou o R$150 fixo); PayPal usa o total real.
- Corrigido o bug do método de pagamento (`metodo` vs `method`).
- Todas as chamadas usam `environment.apiUrl` (sem mais `localhost`/`127.0.0.1` hardcoded).

---

## 2. ⚠️ Antes de tudo: rotacione a senha do banco

A senha antiga (`Vermelho@0010203040`) esteve em arquivos versionados, então considere-a **comprometida**. Escolha uma nova senha e use-a no `.env` (passo 3). Se o repositório for/for ficar público, limpe também o histórico (BFG Repo-Cleaner ou `git filter-repo`).

---

## 3. Configurar variáveis de ambiente

Na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` e preencha:
- `DB_PASSWORD` → a **nova** senha do banco
- `MP_ACCESS_TOKEN` → seu token do Mercado Pago (TEST- para sandbox)
- `DEVISE_JWT_SECRET_KEY` → gere com:
  ```bash
  openssl rand -hex 64
  ```
- `PAYPAL_SKIP_WEBHOOK_VERIFICATION=true` (apenas para testar PayPal localmente)

> Para rodar o Rails **fora do Docker** (`rails s` direto), o `dotenv-rails` lê o `.env` da pasta do Rails. Crie também um `.env` em `ECOMMERCE-BACKEND-RUBY-RAILS-ANGULAR-TAILWIND-SASS/backend/` com as mesmas variáveis (ou exporte-as no shell).

---

## 4. Backend — instalar e migrar

### Com Docker (recomendado)
```bash
docker compose build web          # reinstala as gems (devise, devise-jwt, dotenv)
docker compose up -d
docker compose exec web bin/rails db:migrate
```

### Sem Docker
```bash
cd ECOMMERCE-BACKEND-RUBY-RAILS-ANGULAR-TAILWIND-SASS/backend
bundle install
bin/rails db:migrate
```

> A migration `add_devise_to_users` adiciona os campos do Devise + `jti`. Se a tabela `users` tiver linhas com e-mails duplicados, o índice único de e-mail pode falhar — limpe os dados ou recrie o banco em dev (`bin/rails db:reset`).

### Criar um usuário para testar o login
```bash
docker compose exec web bin/rails console      # ou: bin/rails console
```
```ruby
User.create!(name: "Admin", email: "admin@proway.com", password: "senhaForte123")
```

---

## 5. Frontend — subir

Não há dependências novas (o interceptor usa APIs nativas do Angular). Só rode:

```bash
cd ECOMMERCE-FRONTEND-ANGULAR-TAILWIND-SASS-NODEJS
npm install        # se ainda não tiver node_modules
npm start          # ng serve (usa o proxy.conf.json -> /api)
```

---

## 6. Endpoints de autenticação

| Método | Rota | Corpo |
|---|---|---|
| POST | `/api/v1/signup` | `{ "user": { "name": "...", "email": "...", "password": "..." } }` |
| POST | `/api/v1/login`  | `{ "user": { "email": "...", "password": "..." } }` |
| DELETE | `/api/v1/logout` | (header `Authorization: Bearer <token>`) |

O token JWT volta no **header `Authorization`** da resposta de login/signup (o frontend já lê e guarda isso automaticamente).

---

## 7. Checklist de testes

```bash
# 1) Login (veja o header Authorization na resposta -i)
curl -i -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"admin@proway.com","password":"senhaForte123"}}'

# 2) Listar pedidos SEM token  -> deve dar 401
curl -i http://localhost:3000/api/v1/checkouts

# 3) Listar pedidos COM token  -> deve dar 200
curl -s http://localhost:3000/api/v1/checkouts -H "Authorization: Bearer <TOKEN>"

# 4) Tentar marcar como "pago" manualmente -> deve dar 403
curl -i -X PUT http://localhost:3000/api/v1/checkouts/1 \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"checkout":{"status":"pago"}}'
```

- [ ] Login retorna token no header `Authorization`
- [ ] `/checkouts` sem token = 401; com token = 200
- [ ] `update` com `status: pago` = 403
- [ ] Checkout no site calcula o total a partir do carrinho (não mais R$150)
- [ ] `/login` no Angular loga e redireciona; `/meus-pedidos` exige login

---

## 8. ⚠️ Não foi testado por mim

Escrevi todo o código, mas **não executei** `bundle install`, `db:migrate` nem `ng build`. Pontos a observar ao rodar:
- Compatibilidade de versões `devise` / `devise-jwt` com Rails 7.0.8.1 (o bundler resolve, mas confira o `bundle install`).
- O índice único de e-mail na migration (ver nota no passo 4).
- SSR: o interceptor é seguro para SSR (não acessa `localStorage` no servidor).

---

## 9. Pendências que dependem de você (decisão/credenciais)

1. **PayPal:** hoje o webhook só aceita se `PAYPAL_SKIP_WEBHOOK_VERIFICATION=true` (teste local). Para produção, implemente a verificação real em `verify_paypal_signature` usando `PAYPAL_WEBHOOK_ID` + a API `/v1/notifications/verify-webhook-signature`.
2. **PIX:** `gerar_pix_estatico` ainda devolve um placeholder. Gere um BR Code real (sua chave PIX + valor) ou preencha `PIX_PAYLOAD`.
3. **Duplicações:** não removi os modelos/serviços duplicados (`Pedido` vs `Order`, `cart` vs `carrinho`) para não quebrar nada. Recomendo padronizar em `Order` e `CarrinhoService`.
4. **Cartão (PCI):** não trafegue número/CVV pelo seu backend; use tokenização do gateway.
5. **Produção do frontend:** `environment.prod.ts` tem `apiUrl: ''` e o deploy é GitHub Pages (estático). Defina a URL pública da API para o checkout funcionar em produção.
6. **Limpeza:** rode `bash limpeza.sh` para remover lixo/duplicados (revise antes).

---

## 10. Arquivos novos/alterados

**Backend:** `Gemfile`, `config/routes.rb`, `config/initializers/devise.rb`, `config/initializers/cors.rb`, `config/database.yml`, `app/models/user.rb`, `app/models/order.rb`, `app/controllers/application_controller.rb`, `app/controllers/api/v1/checkouts_controller.rb`, `app/controllers/users/sessions_controller.rb`, `app/controllers/users/registrations_controller.rb`, `app/services/mercado_pago_service.rb`, `db/migrate/20260617120000_add_devise_to_users.rb`

**Frontend:** `src/main.ts`, `src/app/app.routes.ts`, `src/app/services/auth.service.ts`, `src/app/interceptors/auth.interceptor.ts`, `src/app/guards/auth.guard.ts`, `src/app/auth/login/login.component.{ts,html}`, `src/app/checkout/checkout.component.{ts,html}`, `src/app/checkout/step-payment/step-payment.component.ts`, `src/app/services/pedido.service.ts`, `src/app/services/cancelamentos.services.ts`

**Raiz:** `docker-compose.yml`, `.gitignore`, `.env.example`, `limpeza.sh`

---

## 11. Recuperação e troca de senha + Mailtrap

**Endpoints**

| Método | Rota | Corpo |
|---|---|---|
| POST | `/api/v1/password` | `{ "user": { "email": "..." } }` — envia o e-mail de redefinição |
| PUT  | `/api/v1/password` | `{ "user": { "reset_password_token": "...", "password": "...", "password_confirmation": "..." } }` |
| PUT  | `/api/v1/account/password` | `{ "user": { "current_password": "...", "password": "...", "password_confirmation": "..." } }` — logado |

**Telas no Angular:** `/forgot-password`, `/reset-password?token=...`, `/trocar-senha` (protegida). O link "Esqueci minha senha" já aparece na tela de login.

**Configurar o Mailtrap**
1. No Mailtrap, abra sua inbox (Sandbox) → *SMTP Settings* → integração *Ruby on Rails*.
2. Preencha no `.env`: `SMTP_USERNAME` e `SMTP_PASSWORD` (e, se necessário, `SMTP_ADDRESS`/`SMTP_PORT`/`SMTP_AUTHENTICATION`).
3. Defina `FRONTEND_URL` — o link do e-mail aponta para `FRONTEND_URL/#/reset-password?token=...`.

**Fluxo de teste**
1. Crie um usuário (passo 4) e, em `/forgot-password`, informe o e-mail.
2. O e-mail chega na inbox do Mailtrap → clique no link.
3. Em `/reset-password`, defina a nova senha e faça login.
4. Logado, em `/trocar-senha`, troque a senha informando a atual.

**Arquivos desta etapa**
- Backend: `app/controllers/users/passwords_controller.rb`, `app/controllers/api/v1/accounts_controller.rb`, `config/initializers/smtp.rb`, `app/views/devise/mailer/reset_password_instructions.html.erb`, `config/routes.rb`
- Frontend: `src/app/auth/forgot-password/*`, `src/app/auth/reset-password/*`, `src/app/auth/change-password/*`, `src/app/services/auth.service.ts`

> O template do e-mail fica em `app/views/devise/mailer/reset_password_instructions.html.erb`.

---

## 12. Cadastro e logout no frontend

- **Cadastro:** rota `/cadastro` (componente `auth/register`). Usa `POST /api/v1/signup` e já deixa o usuário logado (o token vem no header). Há link "Cadastre-se" na tela de login.
- **Header:** deslogado mostra **Entrar** e **Cadastrar**; logado mostra **Meus Pedidos**, **Trocar Senha** e **Sair** (logout via `DELETE /api/v1/logout`). Os links de auth só renderizam no browser (evita mismatch de hidratação no SSR).
- Arquivos: `src/app/auth/register/*`, `src/app/header/header.component.{ts,html}`, `src/app/app.routes.ts`.

---

## 13. Build do Angular no Docker (sem `ng serve`)

Antes o container do frontend rodava `ng serve` (dev builder) com polling — lento pra subir. Agora a imagem **compila o Angular uma única vez** (Dockerfile multi-stage) e serve os arquivos estáticos com **Nginx**, que também faz proxy de `/api` para o Rails.

- `docker compose up -d` sobe **todos** os containers já prontos (sem dev builder).
- Acesse em `http://localhost:4200` (Nginx escutando na porta 80 do container).
- O Nginx encaminha `/api/...` → `http://web:3000/api/v1/...` (mesmo comportamento do antigo `proxy.conf.json`), então as chamadas ficam **mesma origem** (sem dor de cabeça de CORS).

**Subir tudo:**
```bash
docker compose up -d --build
```

**Importante:** como o frontend é compilado **dentro da imagem**, ao alterar o código do Angular você precisa **rebuildar**:
```bash
docker compose up -d --build frontend
```
Para desenvolvimento ativo com hot reload, rode o Angular **fora** do Docker: `npm start` (usa o `proxy.conf.json`).

**Arquivos desta etapa:** `Dockerfile` (multi-stage), `nginx.conf`, `.dockerignore`, `src/environments/environment.docker.ts` (apiUrl `/api`), `angular.json` (configuração `docker`), `docker-compose.yml`.

---

## 14. Webhook PayPal (assinatura real) + unificação Pedido/Order

**Webhook PayPal**
- `app/services/paypal_service.rb` obtém um token OAuth e chama `/v1/notifications/verify-webhook-signature`. O webhook só é aceito se o PayPal responder `verification_status = SUCCESS`.
- Preencha no `.env`: `PAYPAL_ENV` (`sandbox`/`live`), `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` (PayPal Dashboard → Apps & Credentials / Webhooks).
- Testes locais sem credenciais: mantenha `PAYPAL_SKIP_WEBHOOK_VERIFICATION=true`. **Em produção, deixe `false`.**

**Unificação Pedido/Order**
- O model `Pedido` e a tabela `pedidos` eram órfãos (o código usa só `Order`).
- Migration `drop_pedidos_table` (reversível) remove a tabela — rode `bin/rails db:migrate`.
- O arquivo `app/models/pedido.rb` é removido pelo `limpeza.sh`. (O `PedidoMailer` é mantido — é outra coisa.)
