// Importa o Express
const express = require('express');
const app = express();

// Porta onde o servidor vai rodar
const PORT = 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ mensagem: 'API funcionando com Node.js!' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
