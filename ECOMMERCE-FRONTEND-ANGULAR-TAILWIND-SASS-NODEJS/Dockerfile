# ============================================================
# Estágio 1 — Build do Angular (compila uma única vez)
# ============================================================
FROM node:20-slim AS build

# Dependências para módulos nativos (SASS/Tailwind)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala dependências (cache de camada)
COPY package*.json ./
RUN npm ci || npm install

# Copia o código e gera o build de produção (configuração "docker")
COPY . .
RUN npx ng build --configuration docker

# ============================================================
# Estágio 2 — Servir estático com Nginx (rápido, sem dev server)
# ============================================================
FROM nginx:1.27-alpine

# Configuração com fallback de SPA + proxy /api -> backend Rails
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build gerado (browser builder -> dist/ecommerce-tailwind-sass-new)
COPY --from=build /app/dist/ecommerce-tailwind-sass-new /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
