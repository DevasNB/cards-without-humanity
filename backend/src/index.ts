import express, { Request, Response } from "express"

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler JSON
app.use(express.json());

// Rota de teste
app.get("/", (req: Request, res: Response<string>) => {
    res.status(200).send("Hello, Node.js Backend 🚀");
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
