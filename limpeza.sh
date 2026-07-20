#!/usr/bin/env bash
# ============================================================================
# Script de limpeza do repositório — remove lixo, duplicados e dados temporários.
#
# COMO USAR (a partir da RAIZ do projeto, no WSL):
#   cd ~/BACKUP-PROJETOS-004
#   bash limpeza.sh
#
# Revise a lista abaixo antes de rodar. Depois confira com:  git status
# Nada aqui apaga código que está no lugar certo (backend/ e src/ ficam intactos).
# ============================================================================
set -u

BACK="ECOMMERCE-BACKEND-RUBY-RAILS-ANGULAR-TAILWIND-SASS"
FRONT="ECOMMERCE-FRONTEND-ANGULAR-TAILWIND-SASS-NODEJS"

echo "==> Lixo na raiz do backend (saída de comandos redirecionada por engano / stubs)"
rm -fv "$BACK/=" "$BACK/[internal]" "$BACK/ls" "$BACK/reading"          2>/dev/null || true

echo "==> Arquivos fora do lugar na raiz do backend (os reais estão em $BACK/backend/)"
rm -fv "$BACK/gemfile" "$BACK/config.ru" "$BACK/development.rb"          2>/dev/null || true
rm -fv "$BACK/checkouts_controller.rb" "$BACK/pedido.service.ts"         2>/dev/null || true
rm -fv "$BACK/check_db_config.rb" "$BACK/check_db_connection.rb"         2>/dev/null || true

echo "==> docker-compose duplicado (com senha hardcoded) — o funcional fica na raiz do projeto"
rm -fv "$BACK/docker-compose.yml"                                       2>/dev/null || true

echo "==> Dados/temp do Postgres que não devem ir para o repo"
rm -rfv "$BACK/pgdata" "$BACK/tmp"                                       2>/dev/null || true

echo "==> Modelo órfão Pedido (unificado em Order; a tabela 'pedidos' é removida por migration)"
rm -fv "$BACK/backend/app/models/pedido.rb"                             2>/dev/null || true

echo "==> Arquivos soltos duplicados na raiz do frontend (os reais estão em $FRONT/src/app/)"
rm -fv "$FRONT/checkout.service.ts" "$FRONT/pedido.service.ts" "$FRONT/app-routes.ts" 2>/dev/null || true
rm -fv "$FRONT/checkout-page.component.html" "$FRONT/header.component.html"           2>/dev/null || true
rm -fv "$FRONT/step-review.component.ts"                                              2>/dev/null || true

echo "==> Metadados do Windows (*.Zone.Identifier) em todo o projeto"
find . -name "*Zone.Identifier" -type f -print -delete 2>/dev/null || true

echo ""
echo "==> OPCIONAL (builds versionados) — descomente apenas se tiver certeza:"
echo "    ATENÇÃO: se o GitHub Pages publica a partir de /docs, NÃO remova docs/ sem reconfigurar o deploy."
# rm -rfv "$FRONT/docs"
# rm -rfv "$FRONT/dist"
# Caso 'docs' já esteja versionado e você queira apenas destrackear:
#   git rm -r --cached "$FRONT/docs"

echo ""
echo "Concluído. Revise com 'git status' e, se estiver tudo certo:"
echo "   git add -A && git commit -m 'chore: limpeza de lixo, duplicados e dados temporários'"
