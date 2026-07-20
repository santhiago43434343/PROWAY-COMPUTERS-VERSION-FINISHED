# frozen_string_literal: true

Devise.setup do |config|
  config.mailer_sender = ENV.fetch('DEVISE_MAILER_SENDER', 'no-reply@prowaycomputers.com')

  require 'devise/orm/active_record'

  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true

  # Exige e-mail confirmado para conseguir logar (sem período de carência).
  config.allow_unconfirmed_access_for = 0.days
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete

  # API only: não usar redirect/flash de navegação
  config.navigational_formats = []

  # ----- JWT (devise-jwt) -----
  config.jwt do |jwt|
    jwt.secret = ENV.fetch('DEVISE_JWT_SECRET_KEY') { Rails.application.credentials.secret_key_base }
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/login$}],
      ['POST', %r{^/api/v1/signup$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/logout$}]
    ]
    jwt.expiration_time = 1.day.to_i
  end
end
