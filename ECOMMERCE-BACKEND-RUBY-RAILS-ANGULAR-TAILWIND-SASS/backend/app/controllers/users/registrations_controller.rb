# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  # POST /api/v1/signup
  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: 'Conta criada com sucesso.',
        user: { id: resource.id, email: resource.email, name: resource.name }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
