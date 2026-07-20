# Be sure to restart your server when you modify this file.

# Handle Cross-Origin Resource Sharing (CORS) para aceitar requisições do frontend.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Origens permitidas via ENV (separadas por vírgula). Padrão: Angular local.
    origins(ENV.fetch('CORS_ORIGINS', 'http://localhost:4200,http://127.0.0.1:4200').split(',').map(&:strip))

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization'], # necessário para o frontend ler o token JWT do header
      credentials: true
  end
end
