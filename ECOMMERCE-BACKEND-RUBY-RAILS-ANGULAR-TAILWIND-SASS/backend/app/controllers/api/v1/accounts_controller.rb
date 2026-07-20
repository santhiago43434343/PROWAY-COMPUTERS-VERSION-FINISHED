# frozen_string_literal: true

module Api
  module V1
    class AccountsController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_user!

      # PUT /api/v1/account/password  -> troca de senha do usuário logado
      def update_password
        if current_user.update_with_password(password_params)
          render json: { message: 'Senha alterada com sucesso.' }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def password_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end
    end
  end
end
