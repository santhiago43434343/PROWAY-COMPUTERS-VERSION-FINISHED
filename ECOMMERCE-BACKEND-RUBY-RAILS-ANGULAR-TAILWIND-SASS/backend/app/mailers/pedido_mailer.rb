class PedidoMailer < ApplicationMailer
  default from: 'contato@prowaycomputers.com'

  def confirmacao_pagamento(pedido)
    @pedido = pedido
    # O e-mail vai para o endereço que está salvo no banco de dados
    mail(to: @pedido.emailCliente, subject: "Pagamento Confirmado - Pedido ##{@pedido.id}")
  end
end