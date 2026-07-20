# Configuração de envio de e-mail via SMTP.
# Por padrão usa o Mailtrap (sandbox). Preencha SMTP_USERNAME / SMTP_PASSWORD no .env
# com as credenciais da sua inbox do Mailtrap.
#
# Mailtrap (sandbox): address=sandbox.smtp.mailtrap.io, port=2525, authentication=cram_md5

if ENV['SMTP_USERNAME'].present? && ENV['SMTP_PASSWORD'].present?
  ActionMailer::Base.delivery_method     = :smtp
  ActionMailer::Base.perform_deliveries  = true
  ActionMailer::Base.raise_delivery_errors = true
  ActionMailer::Base.smtp_settings = {
    address:              ENV.fetch('SMTP_ADDRESS', 'sandbox.smtp.mailtrap.io'),
    host:                 ENV.fetch('SMTP_ADDRESS', 'sandbox.smtp.mailtrap.io'),
    port:                 ENV.fetch('SMTP_PORT', '2525').to_i,
    domain:               ENV.fetch('SMTP_DOMAIN', 'sandbox.smtp.mailtrap.io'),
    user_name:            ENV['SMTP_USERNAME'],
    password:             ENV['SMTP_PASSWORD'],
    authentication:       ENV.fetch('SMTP_AUTHENTICATION', 'login').to_sym,
    enable_starttls_auto: true
  }
end

# Usado quando o mailer precisa montar URLs absolutas.
ActionMailer::Base.default_url_options = {
  host: ENV.fetch('MAILER_HOST', 'localhost'),
  port: ENV.fetch('MAILER_PORT', '3000').to_i
}
