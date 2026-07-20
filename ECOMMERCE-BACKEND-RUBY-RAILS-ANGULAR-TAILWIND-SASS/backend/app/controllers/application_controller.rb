require 'net/http'
require 'uri'
require 'json'

class ApplicationController < ActionController::Base
  # APIs JSON são autenticadas via JWT (header Authorization), não por sessão/CSRF.
  protect_from_forgery with: :null_session

  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  # Verifica o reCAPTCHA. Só EXIGE se RECAPTCHA_SECRET_KEY estiver configurada
  # (vazia = reCAPTCHA desativado, para não quebrar o login enquanto não há chaves).
  def verificar_recaptcha
    secret = ENV['RECAPTCHA_SECRET_KEY']
    return if secret.blank?

    token = params[:recaptcha_token]
    Rails.logger.info("reCAPTCHA token recebido? #{token.present?} | tamanho: #{token.to_s.length}")
    unless token.present? && recaptcha_valido?(secret, token)
      render json: { error: 'Falha na verificação do reCAPTCHA. Marque "Não sou um robô" e tente novamente.' },
             status: :unprocessable_entity
    end
  end

  private

  def recaptcha_valido?(secret, token)
    uri = URI('https://www.google.com/recaptcha/api/siteverify')
    res = Net::HTTP.post_form(uri, 'secret' => secret, 'response' => token)
    return false unless res.is_a?(Net::HTTPSuccess)

    body = JSON.parse(res.body)
    Rails.logger.info("reCAPTCHA siteverify => #{body}") # mostra success + error-codes
    body['success'] == true
  rescue StandardError => e
    Rails.logger.error("Erro ao verificar reCAPTCHA: #{e.message}")
    false
  end
end
