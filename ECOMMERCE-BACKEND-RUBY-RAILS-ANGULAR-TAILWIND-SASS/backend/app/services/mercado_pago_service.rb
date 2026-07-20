require 'mercadopago'

class MercadoPagoService
  def initialize
    @sdk = Mercadopago::SDK.new(ENV.fetch('MP_ACCESS_TOKEN'))
  end

  def criar_preferencia(pedido)
    preference_data = {
      items: [
        {
          title: "Pedido ##{pedido.id} - ProwayComputers",
          unit_price: pedido.total.to_f,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/sucesso",
        failure: "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/erro",
        pending: "#{ENV.fetch('FRONTEND_URL', 'http://localhost:4200')}/pendente"
      },
      auto_return: 'approved'
    }

    result = @sdk.preference.create(preference_data)

    if result[:status] == 201 || result[:status] == 200
      result[:response]['init_point']
    else
      raise "Erro ao criar preferência no Mercado Pago: #{result[:response]}"
    end
  end
end
