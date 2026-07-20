# frozen_string_literal: true

class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  # POST /api/v1/password  -> envia o e-mail com instruções de redefinição
  def create
    resource_class.send_reset_password_instructions(resource_params)
    # Não revelamos se o e-mail existe (evita enumeração de usuários)
    render json: {
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções de redefinição.'
    }, status: :ok
  end

  # PUT /api/v1/password  -> redefine a senha usando o token recebido por e-mail
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)

    if resource.errors.empty?
      render json: { message: 'Senha redefinida com sucesso. Faça login novamente.' }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def resource_params
    params.require(:user).permit(:email, :password, :password_confirmation, :reset_password_token)
  end
end
