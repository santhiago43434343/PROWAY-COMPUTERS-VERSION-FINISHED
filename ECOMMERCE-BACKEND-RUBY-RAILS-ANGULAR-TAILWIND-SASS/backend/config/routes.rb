Rails.application.routes.draw do
  # Autenticação (Devise + JWT).
  # Fora do namespace para usar os controllers Users::... e ainda gerar /api/v1/login, etc.
  devise_for :users,
             path: 'api/v1',
             path_names: {
               sign_in: 'login',
               sign_out: 'logout',
               registration: 'signup',
               password: 'password'
             },
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations',
               passwords: 'users/passwords',
               confirmations: 'users/confirmations'
             }

  namespace :api do
    namespace :v1 do
      # Troca de senha do usuário logado
      put 'account/password', to: 'accounts#update_password'

      # Cálculo de frete (Melhor Envio com fallback mock) — público
      post 'frete', to: 'fretes#calcular'

      resources :checkouts do
        member do
          post :cancelar       # Cancelar pedido pendente (somente o dono)
        end
        collection do
          post :webhook        # Webhook do Mercado Pago
          post :paypal_webhook # Webhook do PayPal
          post :confirmar        # Confirmação MP no retorno (verifica no MP)
          post :confirmar_paypal # Cria pedido + captura no PayPal (server-side)
        end
      end

      # Rota de backup do webhook do Mercado Pago
      post 'payments/webhook', to: 'checkouts#webhook'
    end
  end
end
