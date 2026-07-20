class AddFieldsToOrders < ActiveRecord::Migration[7.0]
  def change
    # Comentei as que o log mostrou que já foram (Success)
    # add_column :orders, :cart, :text
    # add_column :orders, :address, :string
    # add_column :orders, :emailCliente, :string

    # REMOVA as linhas de status e total se elas já existirem no seu banco
    # add_column :orders, :status, :string
    # add_column :orders, :total, :decimal
    
    # Mantenha apenas o que falta e não deu erro ainda:
    add_column :orders, :user_id, :integer unless column_exists?(:orders, :user_id)
  end
end
