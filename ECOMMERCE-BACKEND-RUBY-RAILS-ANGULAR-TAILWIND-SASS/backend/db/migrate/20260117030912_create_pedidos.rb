class CreatePedidos < ActiveRecord::Migration[7.0]
  def change
    create_table :pedidos do |t|
      t.string :cliente
      t.string :endereco
      t.string :pagamento
      t.string :delivery
      t.json :cart

      t.timestamps
    end
  end
end
