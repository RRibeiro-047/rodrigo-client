import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readAppointments() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAppointments(list) {
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/agendamentos", async (_req, res) => {
  try {
    const items = await readAppointments();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar agendamentos" });
  }
});

app.post("/api/agendamentos", async (req, res) => {
  try {
    const { nome, telefone, data, servico, observacoes } = req.body || {};
    if (!nome || !telefone || !data || !servico) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, telefone, data, servico",
      });
    }

    const list = await readAppointments();
    const item = {
      id: crypto.randomUUID(),
      nome,
      telefone,
      data,
      servico,
      observacoes: observacoes || "",
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    await writeAppointments(list);

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar agendamento" });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
