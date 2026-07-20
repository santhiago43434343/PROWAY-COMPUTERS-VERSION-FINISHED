FROM ruby:3.2

# Instala dependências do sistema
# libpq-dev é essencial para a gem 'pg' (Postgres)
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    postgresql-client

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências primeiro
# Isso acelera o build pois o Docker pula o 'bundle install' se você não mudou as Gems
COPY Gemfile Gemfile.lock ./

# Instala as gems
RUN bundle install

# Copia o restante do código do projeto
COPY . .

# Expõe a porta do Rails
EXPOSE 3000

# Comando unificado: 
# 1. Remove o PID antigo (evita erro de server already running no Disco D)
# 2. Inicia o servidor ouvindo em todas as interfaces (0.0.0.0)
CMD ["bash", "-c", "rm -f tmp/pids/server.pid && bundle exec rails s -b 0.0.0.0"]
