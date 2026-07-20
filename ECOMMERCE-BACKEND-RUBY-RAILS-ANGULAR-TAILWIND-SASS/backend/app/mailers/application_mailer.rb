class ApplicationMailer < ActionMailer::Base
  # Altere para o e-mail da sua loja ou um e-mail fictício profissional
  default from: "vendas@prowaycomputers.com"
  
  # O layout "mailer" refere-se aos arquivos em views/layouts/mailer.html.erb
  # que definem a "moldura" (estilo) do seu e-mail.
  layout "mailer"
end