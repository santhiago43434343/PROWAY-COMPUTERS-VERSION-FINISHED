class AddDeviseToUsers < ActiveRecord::Migration[7.0]
  def up
    change_table :users, bulk: true do |t|
      ## Database authenticatable
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## JWT (revogação por jti)
      t.string :jti
    end

    # Backfill de jti para usuários já existentes
    User.reset_column_information
    User.where(jti: nil).find_each do |user|
      user.update_columns(jti: SecureRandom.uuid)
    end

    change_column_null :users, :jti, false
    add_index :users, :jti, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :email, unique: true unless index_exists?(:users, :email)
  end

  def down
    remove_index :users, :jti if index_exists?(:users, :jti)
    remove_index :users, :reset_password_token if index_exists?(:users, :reset_password_token)
    remove_index :users, :email if index_exists?(:users, :email)
    remove_columns :users, :encrypted_password, :reset_password_token,
                   :reset_password_sent_at, :remember_created_at, :jti
  end
end
