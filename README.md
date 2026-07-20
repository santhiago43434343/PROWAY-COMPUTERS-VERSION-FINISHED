# 💻 Proway Computers

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Angular](https://img.shields.io/badge/angular_20-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Ruby on Rails](https://img.shields.io/badge/rails_7-%23CC0000.svg?style=for-the-badge&logo=ruby-on-rails&logoColor=white)](https://rubyonrails.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white)](https://www.mercadopago.com.br/)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/)

**E-commerce de produtos de informática e tecnologia** (servidores, notebooks, periféricos), com catálogo, carrinho, checkout em etapas, cálculo de frete, pagamento online (Mercado Pago + PayPal), autenticação com JWT e e-mails transacionais. Arquitetura de serviços **100% dockerizados**, orquestrados via Docker Compose.

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#️-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração (.env)](#️-configuração-env)
- [Como executar](#️-como-executar)
- [Portas e acessos](#-portas-e-acessos)
- [Testando pagamentos](#-testando-pagamentos)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Comandos úteis](#-comandos-úteis)

---

## ✨ Funcionalidades

- 🛒 **Catálogo + carrinho** — listagem de produtos (servidores, notebooks, periféricos), página de detalhes e carrinho de compras.
- 📦 **Checkout em etapas** — endereço, entrega, pagamento e revisão, com barra de progresso.
- 🚚 **Cálculo de frete** — integração com a **Melhor Envio** (a partir de um CEP de origem).
- 💳 **Pagamento online** — **Mercado Pago** (Checkout Pro no cartão + **PIX**) e **PayPal**.
- 🔐 **Autenticação completa** — cadastro, login, "esqueci a senha" / redefinir e alterar senha (Devise + JWT).
- 👁️ **Mostrar/ocultar senha** — nos formulários de login, cadastro, redefinição e alteração de senha.
- 🧾 **Meus Pedidos** — histórico de compras com **selecionar todos** e **excluir vários** de uma vez.
- 📧 **E-mail de confirmação** — enviado após a compra (SMTP / Mailtrap).
- 🍪 **Consentimento de cookies (LGPD)** — banner e painel de preferências.
- 🛡️ **reCAPTCHA** — proteção nos formulários.
- 🔁 **Retorno automático do pagamento** — via ngrok (`auto_return`), o cliente volta pro site após aprovar.

---

## 🏗️ Arquitetura

O sistema é dividido em serviços independentes que conversam pela rede interna do Docker:

| Serviço | Papel | Stack |
|---|---|---|
| **frontend** | Interface do usuário + proxy da API | Angular 20 (compilado) + **Nginx** |
| **web** | Regras de negócio, auth e pagamentos | Ruby on Rails 7 (Devise/JWT) |
| **db** | Banco de dados | PostgreSQL 15 |
| **pgadmin** | Administração visual do banco | pgAdmin 4 |
| **ngrok** | Túnel público (retorno do pagamento) | ngrok |

> O **frontend** já sobe com o Angular **compilado** e servido pelo **Nginx** (não usa `ng serve`). O próprio Nginx faz o **proxy de `/api`** para o backend `web:3000` — assim o mesmo host serve a página e a API, o que é essencial pro retorno do Mercado Pago funcionar via URL pública.

---

## 🚀 Tecnologias

- **Frontend:** Angular 20 (standalone + **SSR / Angular Universal**), Tailwind CSS, SASS, Angular Material, Font Awesome, PayPal JS SDK, TypeScript, RxJS.
- **Backend:** Ruby 3.2 + Ruby on Rails 7.0 (API), Devise + devise-jwt, rack-cors, dotenv-rails, SDK do Mercado Pago, Puma.
- **Banco:** PostgreSQL 15 + pgAdmin 4.
- **Infra:** Docker, Docker Compose, Nginx, WSL2 (Ubuntu), ngrok.

---

## 📦 Pré-requisitos

- **Docker Desktop** (recomendado com integração **WSL2**).
- **Docker Compose** (já vem no Docker Desktop).
- Conta gratuita no **ngrok** (apenas se for testar o retorno automático do pagamento).
- Inbox no **Mailtrap** (sandbox) para receber os e-mails de teste.
- Contas **sandbox** do **Mercado Pago** e do **PayPal** para os pagamentos de teste.

---

## ⚙️ Configuração (.env)

Copie o modelo e preencha com os seus valores:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável | Descrição |
|---|---|
| `DB_USERNAME`, `DB_PASSWORD`, `POSTGRES_DB` | Credenciais do PostgreSQL |
| `APP_BASE_URL`, `FRONTEND_URL`, `CORS_ORIGINS` | URLs da API, do front e origens liberadas no CORS |
| `MP_ACCESS_TOKEN` | Token do Mercado Pago (Checkout Pro / cartão) |
| `MP_PIX_ACCESS_TOKEN` | Token do Mercado Pago (PIX) |
| `DEVISE_JWT_SECRET_KEY` | Segredo para assinar os tokens JWT |
| `PAYPAL_ENV`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` | Credenciais do PayPal |
| `MELHOR_ENVIO_TOKEN`, `MELHOR_ENVIO_SANDBOX`, `FRETE_CEP_ORIGEM` | Cálculo de frete (Melhor Envio) |
| `RECAPTCHA_SECRET_KEY` | Chave secreta do reCAPTCHA |
| `SMTP_*`, `MAILER_*` | Credenciais e host do Mailtrap (e-mail) |
| `NGROK_AUTHTOKEN` | Token da sua conta ngrok (usado pelo serviço `ngrok`) |

> ⚠️ **O `.env` nunca deve ir para o Git** — ele já está no `.gitignore`. Versione apenas o `.env.example` (sem valores reais).

---

## ▶️ Como executar

```bash
# 1. Clone o repositório
git clone https://github.com/santhiago4343434343/PROWAY-COMPUTERS-VERSION-FINISHED.git
cd PROWAY-COMPUTERS-VERSION-FINISHED

# 2. Configure o ambiente
cp .env.example .env      # e preencha os valores

# 3. Suba os containers
docker compose up -d

# 4. Acompanhe a inicialização (opcional)
docker compose logs -f web
```

Depois é só abrir **http://localhost:4200** no navegador.

> 💡 Diferente de um projeto com `ng serve`, aqui o frontend já vem **compilado** dentro da imagem e servido pelo Nginx — sobe rápido e não precisa esperar "Compiled successfully".

Para subir **enxuto** (só o essencial):
```bash
docker compose up -d db web frontend
```

---

## 🌐 Portas e acessos

| Serviço | URL / Porta |
|---|---|
| Frontend (site) | http://localhost:4200 |
| API (Rails) | http://localhost:3000 |
| pgAdmin | http://localhost:8080 |
| PostgreSQL | `localhost:5432` |

---

## 💳 Testando pagamentos

**Mercado Pago (sandbox):**
1. **Cartão (Checkout Pro):** pague **logado com um Comprador de teste**, usando um **cartão de teste** com titular **`APRO`** e CPF **`12345678909`** → pagamento aprovado.
2. **PIX:** aprova via simulação de sandbox.

**PayPal (sandbox):** use uma conta comprador de teste (sandbox) para concluir o pagamento.

### Retorno automático + e-mail (via ngrok)

O Mercado Pago **não redireciona para `localhost`**. Para o retorno automático (`auto_return`) e o e-mail de confirmação funcionarem, o frontend precisa estar acessível por uma **URL pública** — o serviço `ngrok` do compose cuida disso. Configure o `NGROK_AUTHTOKEN` no `.env`, aponte a `FRONTEND_URL` para o seu domínio ngrok, e acesse o site pela URL do ngrok durante o pagamento. Ao aprovar, o Mercado Pago volta sozinho para o site → o pedido é confirmado → o e-mail cai no Mailtrap.

> ℹ️ No plano gratuito, o domínio fixo do ngrok atende **um projeto por vez**. Se você também roda o Trip Bus National, **suba a Proway com o outro projeto parado**.

---

## 📁 Estrutura do projeto

```
PROWAY-COMPUTERS-VERSION-FINISHED/
├── ECOMMERCE-FRONTEND-ANGULAR-TAILWIND-SASS-NODEJS/   # Frontend Angular 20 + Nginx
├── ECOMMERCE-BACKEND-RUBY-RAILS-ANGULAR-TAILWIND-SASS/
│   └── backend/                                        # API em Ruby on Rails 7
├── docker-compose.yml                                  # Orquestração dos serviços
└── .env.example                                        # Modelo das variáveis de ambiente
```

---

## 🧰 Comandos úteis

```bash
docker compose ps                     # o que está rodando
docker compose logs -f web            # logs da API (Rails)
docker compose logs -f frontend       # logs do frontend (Nginx)
docker compose stop                   # pausa tudo (sem apagar dados)
docker compose down                   # derruba os containers
docker compose up -d --force-recreate frontend   # recria só o frontend
```

---

> Projeto desenvolvido para fins de estudo — integrando frontend, API, banco de dados e gateways de pagamento (Mercado Pago + PayPal) num ambiente full-stack 100% dockerizado. 💻🚀
