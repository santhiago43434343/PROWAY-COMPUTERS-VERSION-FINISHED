class DropPedidosTable < ActiveRecord::Migration[7.0]
  # Tabela órfã: o app usa apenas `orders`/`Order`. (PedidoMailer não é afetado.)
  def up
    drop_table :pedidos, if_exists: true
  end

  def down
    create_table :pedidos do |t|
      t.string :cliente
      t.string :endereco
      t.string :pagamento
      t.string :delivery
      t.json   :cart
      t.timestamps
    end
  end
end
