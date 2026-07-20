# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  respond_to :json
  before_action :verificar_recaptcha, only: [:create]

  private

  # POST /api/v1/login  -> o token JWT vai no header "Authorization" da resposta
  def respond_with(resource, _opts = {})
    render json: {
      message: 'Login realizado com sucesso.',
      user: { id: resource.id, email: resource.email, name: resource.name }
    }, status: :ok
  end

  # DELETE /api/v1/logout
  def respond_to_on_destroy
    render json: { message: 'Logout realizado.' }, status: :ok
  end
end
