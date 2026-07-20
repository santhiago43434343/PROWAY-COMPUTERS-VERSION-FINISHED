class Order < ApplicationRecord
  belongs_to :user, optional: true

  STATUS_VALIDOS = %w[pendente pago cancelado].freeze

  validates :total, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: STATUS_VALIDOS }
  validates :emailCliente, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
end
