class AddUrlPagamentoToOrders < ActiveRecord::Migration[7.0]
  def change
    add_column :orders, :url_pagamento, :string
  end
end
