const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler JSON
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("Hello, Node.js Backend 🚀");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
