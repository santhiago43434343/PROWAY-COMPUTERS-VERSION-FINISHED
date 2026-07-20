# frozen_string_literal: true

require 'net/http'
require 'uri'
require 'json'

# Verifica a autenticidade dos webhooks do PayPal usando a API oficial de verificação.
class PaypalService
  def initialize
    @base = ENV.fetch('PAYPAL_ENV', 'sandbox') == 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
    @client_id     = ENV['PAYPAL_CLIENT_ID']
    @client_secret = ENV['PAYPAL_CLIENT_SECRET']
    @webhook_id    = ENV['PAYPAL_WEBHOOK_ID']
  end

  # headers: request.headers (aceita as chaves "PAYPAL-*"); raw_body: request.raw_post
  def verify_webhook(headers, raw_body)
    return false if @client_id.blank? || @client_secret.blank? || @webhook_id.blank?

    token = access_token
    return false unless token

    payload = {
      transmission_id:   headers['PAYPAL-TRANSMISSION-ID'],
      transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
      cert_url:          headers['PAYPAL-CERT-URL'],
      auth_algo:         headers['PAYPAL-AUTH-ALGO'],
      transmission_sig:  headers['PAYPAL-TRANSMISSION-SIG'],
      webhook_id:        @webhook_id,
      webhook_event:     JSON.parse(raw_body)
    }

    result = post_json("#{@base}/v1/notifications/verify-webhook-signature", payload, bearer: token)
    result && result['verification_status'] == 'SUCCESS'
  rescue StandardError => e
    Rails.logger.error("Falha ao verificar webhook do PayPal: #{e.message}")
    false
  end

  # Captura (efetiva) um pedido aprovado no PayPal. Retorna a resposta (status "COMPLETED" se OK).
  def capturar(order_id)
    return nil if @client_id.blank? || @client_secret.blank?

    token = access_token
    return nil unless token

    post_json("#{@base}/v2/checkout/orders/#{order_id}/capture", {}, bearer: token)
  rescue StandardError => e
    Rails.logger.error("Falha ao capturar pagamento PayPal: #{e.message}")
    nil
  end

 # Consulta o status atual de um pedido no PayPal (GET) — fallback p/ "já capturado".
  def detalhes(order_id)
    return nil if @client_id.blank? || @client_secret.blank?
    token = access_token
    return nil unless token
    get_json("#{@base}/v2/checkout/orders/#{order_id}", bearer: token)
  rescue StandardError => e
    Rails.logger.error("Falha ao consultar pedido PayPal: #{e.message}")
    nil
  end

   private

  def access_token
    uri = URI("#{@base}/v1/oauth2/token")
    req = Net::HTTP::Post.new(uri)
    req.basic_auth(@client_id, @client_secret)
    req['Content-Type'] = 'application/x-www-form-urlencoded'
    req.body = 'grant_type=client_credentials'

    res = perform(uri, req)
    res && res['access_token']
  end

  def post_json(url, body, bearer:)
    uri = URI(url)
    req = Net::HTTP::Post.new(uri)
    req['Content-Type']  = 'application/json'
    req['Authorization'] = "Bearer #{bearer}"
    req.body = body.to_json
    perform(uri, req)
  end
  
  def get_json(url, bearer:)
    uri = URI(url)
    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "Bearer #{bearer}"
    perform(uri, req)
  end

  def perform(uri, req)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10
    res = http.request(req)
    unless res.is_a?(Net::HTTPSuccess)
      Rails.logger.error("PayPal #{req.method} #{uri.path} => #{res.code}: #{res.body}")
      return nil
    end
    JSON.parse(res.body)
  end
end
