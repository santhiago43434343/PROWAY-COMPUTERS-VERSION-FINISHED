#!/bin/bash
set -e

cd /app
rm -f tmp/pids/server.pid

echo "===> Diretório atual:"
pwd 
echo "===> Conteúdo de /app:"
ls -l 

# Definir valores padrão caso variáveis não estejam setadas
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
POSTGRES_DB=${POSTGRES_DB:-ecommerce}

echo "==> Aguardando Postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD pg_isready -h db -p 5432 -U $POSTGRES_USER; do
  sleep 2
done
echo "db:5432 - accepting connections"

echo "==> Preparando banco..."
bundle exec rails db:prepare RAILS_ENV=development

echo "==> Iniciando aplicação..."
exec bundle exec rails server -b 0.0.0.0 -p 3000
