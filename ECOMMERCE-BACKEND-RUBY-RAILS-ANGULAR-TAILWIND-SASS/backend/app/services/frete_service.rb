require 'net/http'
require 'uri'
require 'json'

# Calcula frete.
# - Com MELHOR_ENVIO_TOKEN configurado => usa a API do Melhor Envio.
# - Sem token => cai num MOCK por região (pra demo no localhost).
class FreteService
  def initialize
    @token  = ENV['MELHOR_ENVIO_TOKEN']
    @origem = ENV['FRETE_CEP_ORIGEM'].presence&.gsub(/\D/, '') || '01001000' # Praça da Sé, SP
    @base   = ENV['MELHOR_ENVIO_SANDBOX'].to_s == 'false' ?
                'https://www.melhorenvio.com.br' :
                'https://sandbox.melhorenvio.com.br'
  end

  # cep_destino: String | itens: [{ 'preco' =>, 'quantidade' => }, ...]
  def calcular(cep_destino, itens = [])
    destino = cep_destino.to_s.gsub(/\D/, '')
    return { erro: 'CEP inválido. Use 8 dígitos.' } unless destino.length == 8

    if @token.present?
      calcular_melhor_envio(destino, itens)
    else
      calcular_mock(destino, itens)
    end
  rescue StandardError => e
    Rails.logger.error("Erro ao calcular frete: #{e.message}")
    calcular_mock(cep_destino.to_s.gsub(/\D/, ''), itens) # fallback resiliente
  end

  private

  def calcular_melhor_envio(destino, itens)
    uri = URI("#{@base}/api/v2/me/shipment/calculate")
    corpo = {
      from: { postal_code: @origem },
      to:   { postal_code: destino },
      products: montar_produtos(itens)
    }

    req = Net::HTTP::Post.new(uri)
    req['Authorization'] = "Bearer #{@token}"
    req['Content-Type']  = 'application/json'
    req['Accept']        = 'application/json'
    req['User-Agent']    = 'ProwayComputers (contato@prowaycomputers.com.br)'
    req.body = corpo.to_json

    res   = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(req) }
    dados = JSON.parse(res.body)

    opcoes = Array(dados).filter_map do |o|
      next if o['error'].present? || o['price'].blank?
      {
        servico: [o.dig('company', 'name'), o['name']].compact.join(' ').strip,
        preco:   o['price'].to_f,
        prazo:   o['delivery_time'].to_i
      }
    end

    opcoes.any? ? { opcoes: opcoes } : calcular_mock(destino, itens)
  end

  def montar_produtos(itens)
    itens = [{ 'preco' => 100, 'quantidade' => 1 }] if itens.blank?
    itens.map do |it|
      {
        width:  15, height: 10, length: 20,        # cm (caixa padrão)
        weight: 0.5,                               # kg por item (padrão)
        insurance_value: it['preco'].to_f,
        quantity: (it['quantidade'] || 1).to_i
      }
    end
  end

  # MOCK por região (1º dígito do CEP) + peso total. Só pra demo sem token.
  def calcular_mock(destino, itens)
    qtd    = itens.blank? ? 1 : itens.sum { |i| (i['quantidade'] || 1).to_i }
    peso   = [qtd * 0.5, 0.5].max
    regiao = destino.to_s[0].to_i
    base   = 20 + (regiao * 3) + (peso * 5)

    {
      opcoes: [
        { servico: 'Correios PAC',    preco: base.round(2),         prazo: 7 + regiao },
        { servico: 'Correios SEDEX',  preco: (base * 1.8).round(2), prazo: 2 + (regiao / 3) },
        { servico: 'Jadlog .Package', preco: (base * 1.3).round(2), prazo: 4 + (regiao / 2) }
      ],
      mock: true
    }
  end
end
