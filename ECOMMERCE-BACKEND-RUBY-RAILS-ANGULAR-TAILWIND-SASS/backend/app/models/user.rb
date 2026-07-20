class User < ApplicationRecord
  # Estratégia de revogação de JWT baseada na coluna `jti`
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :orders, dependent: :nullify
end
