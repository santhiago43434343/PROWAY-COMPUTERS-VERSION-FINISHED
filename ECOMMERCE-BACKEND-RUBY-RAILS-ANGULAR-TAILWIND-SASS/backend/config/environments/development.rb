require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Configurações padrão do Rails para Desenvolvimento
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true

  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true
    config.cache_store = :memory_store
    config.public_file_server.headers = {
      "Cache-Control" => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false
    config.cache_store = :null_store
  end

  config.active_storage.service = :local
  config.action_mailer.perform_caching = false
  config.active_support.deprecation = :log
  config.active_support.disallowed_deprecation = :raise
  config.active_support.disallowed_deprecation_warnings = []
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.assets.quiet = true

  # Configurações de Hosts para Docker e Ngrok
  config.hosts.clear
  config.hosts << "web"
  config.hosts << "localhost"
  config.hosts << "127.0.0.1"
  config.hosts << "combinative-rita-nonconspiratorial.ngrok-free.dev"
  
  # --- CONFIGURAÇÃO DO MAILTRAP ---
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.perform_deliveries = true
  config.action_mailer.raise_delivery_errors = true # Importante para ver erros de senha
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }

  # Lê do .env (antes era hardcoded). Assim você controla o inbox do Mailtrap pelo .env
  # sem mexer no código — troque SMTP_USERNAME/SMTP_PASSWORD pelas credenciais do SEU inbox.
  config.action_mailer.smtp_settings = {
    :user_name => ENV['SMTP_USERNAME'],
    :password  => ENV['SMTP_PASSWORD'],
    :address   => ENV.fetch('SMTP_ADDRESS', 'sandbox.smtp.mailtrap.io'),
    :host      => ENV.fetch('SMTP_ADDRESS', 'sandbox.smtp.mailtrap.io'),
    :port      => ENV.fetch('SMTP_PORT', '2525'),
    :authentication => (ENV['SMTP_AUTHENTICATION'].presence || 'plain').to_sym,
    :enable_starttls_auto => true
  }
  # --------------------------------
end