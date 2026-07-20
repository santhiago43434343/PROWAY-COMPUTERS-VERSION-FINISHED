class FixOrdersTable < ActiveRecord::Migration[7.0]
  def change
    # Adiciona as colunas que faltam na tabela 'orders' para bater com o Angular
    add_column :orders, :cart, :text unless column_exists?(:orders, :cart)
    add_column :orders, :address, :string unless column_exists?(:orders, :address)
    add_column :orders, :emailCliente, :string unless column_exists?(:orders, :emailCliente)
    add_column :orders, :delivery, :string unless column_exists?(:orders, :delivery)
    add_column :orders, :payment, :string unless column_exists?(:orders, :payment)
  end
end
