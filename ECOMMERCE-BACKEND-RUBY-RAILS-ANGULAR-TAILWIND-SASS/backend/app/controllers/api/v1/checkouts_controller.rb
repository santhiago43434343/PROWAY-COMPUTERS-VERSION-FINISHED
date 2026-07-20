require 'mercadopago'

module Api
  module V1
    class CheckoutsController < ApplicationController
      skip_before_action :verify_authenticity_token

      # create e os webhooks são públicos (checkout de visitante + callbacks dos gateways).
      # Listar / editar / excluir pedidos exige usuário autenticado.
      before_action :authenticate_user!, only: [:index, :update, :destroy, :cancelar]

      # GET - Listar pedidos do usuário logado
      def index
        @pedidos = current_user.orders.order(created_at: :desc)
        render json: @pedidos
      end

      # POST /api/v1/checkouts/confirmar
      # Confirma o pagamento consultando o Mercado Pago (o webhook não alcança o localhost).
      # Verificação SERVER-SIDE: não confia no status enviado pelo cliente.
      def confirmar
        payment_id = params[:payment_id]
        return render(json: { error: "payment_id ausente" }, status: :bad_request) if payment_id.blank?

        resp = buscar_pagamento_mp(payment_id)
        return render(json: { status: 'desconhecido' }, status: :ok) if resp.nil?

        aprovado = resp['status'] == 'approved'

        # SANDBOX: PIX de teste não pode ser pago de verdade no Mercado Pago.
        # Com PIX_SIMULAR_APROVACAO=true, simula a aprovação de um PIX pendente (NUNCA em produção).
        if !aprovado && ENV['PIX_SIMULAR_APROVACAO'].to_s == 'true' &&
           resp && resp['payment_method_id'] == 'pix' &&
           %w[pending in_process].include?(resp['status'])
          aprovado = true
        end

        if aprovado
          @pedido = Order.find_by(id: resp['external_reference'])
          if @pedido && @pedido.status != 'pago'
            @pedido.update(status: 'pago')
            PedidoMailer.confirmacao_pagamento(@pedido).deliver_later
            Rails.logger.info("Pedido ##{@pedido.id} confirmado (MP/PIX); e-mail para #{@pedido.emailCliente}")
          end
          render json: { status: 'pago', pedido_id: @pedido&.id, rastreio: (@pedido && "PED-#{@pedido.id}") }, status: :ok
        else
          render json: { status: resp&.dig('status') || 'desconhecido' }, status: :ok
        end
      rescue StandardError => e
        Rails.logger.error("Erro ao confirmar pagamento: #{e.message}")
        render json: { error: "Não foi possível confirmar o pagamento" }, status: :bad_gateway
      end

      # POST /api/v1/checkouts/confirmar_paypal
      # Cria o pedido e CAPTURA o pagamento no PayPal (server-side). Marca "pago" se COMPLETED.
      def confirmar_paypal
        paypal_order_id = params[:paypal_order_id]
        return render(json: { error: "paypal_order_id ausente" }, status: :bad_request) if paypal_order_id.blank?

        @pedido = Order.new(checkout_params)
        @pedido.user_id    ||= current_user&.id
        @pedido.emailCliente = current_user.email if @pedido.emailCliente.blank? && current_user
        @pedido.payment      = 'paypal'
        @pedido.status       = 'pendente'
        return render(json: { errors: @pedido.errors.full_messages }, status: :unprocessable_entity) unless @pedido.save

       servico = PaypalService.new
        resultado = servico.capturar(paypal_order_id)
        pago = resultado && resultado['status'] == 'COMPLETED'

        # Fallback: se não veio COMPLETED (ex.: já capturado no navegador), confere o status real.
        unless pago
          detalhes = servico.detalhes(paypal_order_id)
          pago = detalhes && detalhes['status'] == 'COMPLETED'
          resultado ||= detalhes
        end

        if pago

          @pedido.update(status: 'pago')
          PedidoMailer.confirmacao_pagamento(@pedido).deliver_later
          Rails.logger.info("Pedido ##{@pedido.id} pago via PayPal; e-mail para #{@pedido.emailCliente}")
          render json: { status: 'pago', pedido_id: @pedido.id, rastreio: "PED-#{@pedido.id}" }, status: :ok
        else
          render json: { status: 'pendente', pedido_id: @pedido.id, detalhe: resultado }, status: :ok
        end
      rescue StandardError => e
        Rails.logger.error("Erro ao confirmar PayPal: #{e.message}")
        render json: { error: "Não foi possível confirmar o pagamento PayPal" }, status: :bad_gateway
      end

      # POST - Criar pedido (início do checkout)
      def create
        @pedido = Order.new(checkout_params)
        @pedido.user_id ||= current_user&.id
        # Usa o e-mail do usuário logado para a confirmação, se não veio um no checkout
        @pedido.emailCliente = current_user.email if @pedido.emailCliente.blank? && current_user
        @pedido.status ||= 'pendente'

        if @pedido.save
          case @pedido.payment
          when 'mercadopago'
            configurar_mercado_pago
          when 'pix'
            gerar_pix
          else
            render json: @pedido, status: :created
          end
        else
          render json: { errors: @pedido.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # --- WEBHOOK MERCADO PAGO ---
      # Confirma o pagamento consultando a API do MP (não confia cegamente no corpo).
      def webhook
        payment_id = params.dig(:data, :id) || params[:id]

        if payment_id && (params[:type] == 'payment' || params[:action].to_s.include?('payment'))
          resp = buscar_pagamento_mp(payment_id)

          if resp
            status_real = resp['status']
            pedido_id   = resp['external_reference']
            @pedido = Order.find_by(id: pedido_id)

            if @pedido && status_real == 'approved' && @pedido.status != 'pago'
              @pedido.update(status: 'pago')
              PedidoMailer.confirmacao_pagamento(@pedido).deliver_later
              Rails.logger.info("Confirmação de pagamento (Mercado Pago) enviada para #{@pedido.emailCliente}")
            end
          end
        end
        head :ok
      end

      # --- WEBHOOK PAYPAL ---
      # IMPORTANTE: valida a assinatura do PayPal antes de confiar no corpo da requisição.
      def paypal_webhook
        return head(:unauthorized) unless verify_paypal_signature

        evento  = params[:event_type]
        recurso = params[:resource] || {}

        if evento == "PAYMENT.CAPTURE.COMPLETED" || evento == "PAYMENTS.PAYMENT.CREATED"
          pedido_id = recurso[:custom_id] || recurso[:invoice_number]
          @pedido = Order.find_by(id: pedido_id)

          if @pedido && @pedido.status != 'pago'
            @pedido.update(status: 'pago')
            PedidoMailer.confirmacao_pagamento(@pedido).deliver_later
            Rails.logger.info("Confirmação de pagamento (PayPal) enviada para #{@pedido.emailCliente}")
          end
        end
        head :ok
      end

      # PUT - Atualizar status (somente autenticado)
      def update
        @pedido = current_user.orders.find_by(id: params[:id])
        return render(json: { error: "Pedido não encontrado" }, status: :not_found) unless @pedido

        novo_status = params.dig(:checkout, :status) || params[:status]

        # Segurança: "pago" só é definido pela confirmação do gateway (webhook), nunca pelo cliente.
        if novo_status == 'pago'
          return render json: { error: "O status 'pago' só é definido pela confirmação de pagamento." },
                        status: :forbidden
        end

        if @pedido.update(status: novo_status)
          render json: { message: "Status atualizado!", pedido: @pedido }, status: :ok
        else
          render json: { error: "Erro ao salvar", detalhes: @pedido.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      # DELETE - Remover pedido (somente autenticado)
      def destroy
        @pedido = current_user.orders.find_by(id: params[:id])
        if @pedido
          @pedido.destroy
          render json: { message: "Pedido ##{params[:id]} removido" }, status: :ok
        else
          render json: { error: "Pedido não encontrado" }, status: :not_found
        end
      end

      # POST - Cancelar pedido (somente o dono; apenas pedidos NÃO pagos)
      def cancelar
        @pedido = current_user.orders.find_by(id: params[:id])
        return render(json: { error: "Pedido não encontrado" }, status: :not_found) unless @pedido

        # Pedido já pago precisa de estorno (refund), não de cancelamento simples.
        if @pedido.status == 'pago'
          return render json: { error: "Pedido pago não pode ser cancelado diretamente — requer estorno." },
                        status: :unprocessable_entity
        end

        if @pedido.update(status: 'cancelado')
          render json: { message: "Pedido cancelado", pedido: @pedido }, status: :ok
        else
          render json: { error: "Não foi possível cancelar", detalhes: @pedido.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      private

      # --- Mercado Pago: dois tokens (no sandbox cada método precisa de um "mundo" diferente) ---
      # Checkout Pro (cartão / Saldo logado) usa o token do vendedor de teste (APP_USR-...).
      def mp_token_checkout
        ENV.fetch('MP_ACCESS_TOKEN')
      end

      # PIX (API de Pagamentos) usa o token de TESTE da conta real.
      # Se MP_PIX_ACCESS_TOKEN não existir (ex.: produção, token único), cai no MP_ACCESS_TOKEN.
      def mp_token_pix
        ENV.fetch('MP_PIX_ACCESS_TOKEN', ENV.fetch('MP_ACCESS_TOKEN'))
      end

      # Um pagamento só é visível pelo token que o criou. Como confirmar/webhook atendem
      # aos dois fluxos (cartão e PIX), tentamos os dois tokens e usamos o que enxergar o pagamento.
      def buscar_pagamento_mp(payment_id)
        [mp_token_checkout, mp_token_pix].uniq.each do |token|
          begin
            info = Mercadopago::SDK.new(token).payment.get(payment_id)
            resp = info[:response]
            # Achou com o token certo quando o corpo traz o 'id' do pagamento.
            # (token errado devolve erro 404, sem 'id'.)
            return resp if resp.is_a?(Hash) && resp['id']
          rescue StandardError => e
            Rails.logger.warn("MP payment.get falhou com um token: #{e.message}")
          end
        end
        nil
      end

      def checkout_params
        params.require(:checkout).permit(:total, :user_id, :status, :emailCliente,
                                         :address, :cart, :delivery, :payment, :url_pagamento)
      end

      def configurar_mercado_pago
        sdk = Mercadopago::SDK.new(mp_token_checkout)
        frontend = ENV.fetch('FRONTEND_URL', 'http://localhost:4200')

        preference_data = {
          "items" => [{
            "title" => "Pedido ##{@pedido.id} - ProwayComputers",
            "unit_price" => @pedido.total.to_f,
            "quantity" => 1,
            "currency_id" => "BRL"
          }],
          # Payer com e-mail FAKE e único: comprador vira convidado de teste DISTINTO do dono
          # do token TEST. Sem isso o sandbox entende "pagar a si mesmo" e devolve
          # "não foi possível processar o pagamento".
          "payer" => { "email" => "comprador.teste.#{@pedido.id}@teste.com" },
          "external_reference" => @pedido.id.to_s,
          # Para onde o Mercado Pago redireciona o cliente após o pagamento.
          # Aponta para uma página que devolve o usuário para a rota Angular de retorno.
          "back_urls" => {
            "success" => "#{frontend}/mp-return.html",
            "failure" => "#{frontend}/mp-return.html",
            "pending" => "#{frontend}/mp-return.html"
          },
          "notification_url" => "#{ENV.fetch('APP_BASE_URL', 'http://localhost:3000')}/api/v1/checkouts/webhook"
        }

        # auto_return (redireciona sozinho) só é aceito pelo MP com URL pública.
        # Em localhost o MP rejeita (erro 400), então só ativamos fora de localhost.
        preference_data["auto_return"] = "approved" unless frontend.include?("localhost")

        response = sdk.preference.create(preference_data)
        resposta = response[:response] || {}

        # Com credenciais de TESTE, o init_point já redireciona automaticamente para o sandbox.
        # (o sandbox_init_point legado causa ERR_TOO_MANY_REDIRECTS no login do sandbox)
        url_mp = resposta['init_point'] || resposta['sandbox_init_point']

        if url_mp
          @pedido.update_columns(url_pagamento: url_mp)
          render json: { id: @pedido.id, url_pagamento: url_mp, status: @pedido.status }, status: :created
        else
          render json: { error: "Erro ao gerar link MP", detalhe: resposta }, status: :bad_request
        end
      end

      # Gera um pagamento PIX REAL via API do Mercado Pago (QR Code + copia-e-cola).
      # Sandbox: payer.first_name "APRO" faz o MP APROVAR automaticamente (para teste).
      def gerar_pix
        sdk = Mercadopago::SDK.new(mp_token_pix)
        payment_data = {
          transaction_amount: @pedido.total.to_f,
          description: "Pedido ##{@pedido.id} - ProwayComputers",
          payment_method_id: 'pix',
          external_reference: @pedido.id.to_s,
          payer: {
            email: @pedido.emailCliente.presence || 'comprador@teste.com',
            first_name: 'APRO', # sandbox: aprova sozinho. Em produção, use o nome real do pagador.
            identification: { type: 'CPF', number: '19119119100' } # CPF de teste (sandbox)
          }
        }

        resposta  = sdk.payment.create(payment_data)
        pagamento = resposta[:response] || {}
        tx = pagamento.dig('point_of_interaction', 'transaction_data') || {}

        if tx['qr_code'].present?
          render json: {
            id: @pedido.id,
            status: @pedido.status,
            pix_payment_id: pagamento['id'],
            pix_copia_e_cola: tx['qr_code'],
            pix_qr_base64: tx['qr_code_base64']
          }, status: :created
        else
          Rails.logger.error("Falha ao gerar PIX: #{pagamento}")
          render json: { error: 'Não foi possível gerar o PIX', detalhe: pagamento }, status: :bad_request
        end
      rescue StandardError => e
        Rails.logger.error("Erro ao gerar PIX: #{e.message}")
        render json: { error: 'Erro ao gerar o PIX' }, status: :bad_gateway
      end

      # Valida a assinatura do webhook do PayPal via API oficial de verificação.
      # Para TESTES LOCAIS, pode-se setar PAYPAL_SKIP_WEBHOOK_VERIFICATION=true (NUNCA em produção).
      def verify_paypal_signature
        return true if ENV['PAYPAL_SKIP_WEBHOOK_VERIFICATION'] == 'true'

        PaypalService.new.verify_webhook(request.headers, request.raw_post)
      end
    end
  end
end
