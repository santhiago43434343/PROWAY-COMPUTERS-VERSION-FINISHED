const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; // ALTERADO: 3000 era usado pelo Rails

// Configuração de CORS para permitir seu ambiente Docker
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Banco de dados fake em memória
let pedidos = [
  { id: 1, cliente: 'Santhiago', status: 'pendente', rastreio: 'BR123456789' },
  { id: 2, cliente: 'Maria', status: 'enviado', rastreio: 'BR987654321' }
];

app.get('/pedidos', (req, res) => {
  res.json(pedidos);
});

app.post('/pedidos', (req, res) => {
  const novoPedido = {
    id: pedidos.length + 1,
    cliente: req.body.cliente || 'Novo Cliente',
    status: 'finalizado',
    rastreio: 'BR' + Math.floor(Math.random() * 1000000000)
  };
  pedidos.push(novoPedido);
  res.json({ message: 'Pedido criado com sucesso!', pedido: novoPedido });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock Backend rodando em http://0.0.0.0:${PORT}`);
});