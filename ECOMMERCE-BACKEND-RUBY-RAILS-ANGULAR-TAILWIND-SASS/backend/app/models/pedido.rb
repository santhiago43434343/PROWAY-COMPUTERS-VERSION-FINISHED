class Pedido < ApplicationRecord
   # Isso permite que você acesse pedido.cart como um Hash do Ruby
   serialize :cart, JSON
end
