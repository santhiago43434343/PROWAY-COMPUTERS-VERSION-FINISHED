module Api
  module V1
    class FretesController < ApplicationController
      # Cálculo de frete é público (acontece antes do login).
      def calcular
        permitido = params.permit(:cep, itens: [:preco, :quantidade])
        resultado = FreteService.new.calcular(permitido[:cep], permitido[:itens] || [])

        if resultado[:erro]
          render json: resultado, status: :unprocessable_entity
        else
          render json: resultado, status: :ok
        end
      end
    end
  end
end
