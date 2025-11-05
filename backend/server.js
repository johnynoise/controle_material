import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET - listar materiais
app.get("/materiais", async (req, res) => {
  try {
    const materiais = await prisma.material.findMany();
    res.json(materiais);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar materiais" });
  }
});

// POST - adicionar material
app.post("/materiais", async (req, res) => {
  const { nome, descricao, quantidade, localizacao } = req.body;
  console.log("POST /materiais body:", req.body);
  try {
    // Ensure quantidade is an integer before saving
    const quantidadeInt = quantidade === undefined || quantidade === null ? 0 : Number(quantidade);
    const novo = await prisma.material.create({
      data: { nome, descricao, quantidade: quantidadeInt, localizacao },
    });
    console.log("Material criado:", novo);
    res.status(201).json(novo);
  } catch (err) {
    console.error("Erro ao criar material:", err);
    res.status(500).json({ error: "Erro ao adicionar material" });
  }
});

// PUT - atualizar material
app.put("/materiais/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, quantidade, localizacao } = req.body;
  try {
    const atualizado = await prisma.material.update({
      where: { id: Number(id) },
      data: { nome, descricao, quantidade, localizacao },
    });
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar material" });
  }
});

// DELETE - remover material
app.delete("/materiais/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.material.delete({ where: { id: Number(id) } });
    res.json({ message: "Material removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover material" });
  }
});

// Iniciar o servidor
app.listen(3001, () => console.log("🚀 API rodando em http://localhost:3001"));
