// WARNING: This implementation keeps data in-memory per serverless instance.
// It is not durable storage. For production persistence, use a database
// (e.g., Vercel Postgres, Neon, Supabase, PlanetScale) or Vercel KV/Blob.

let LIST = [];

export default async function handler(req, res) {
  // Basic CORS for cross-origin if needed
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    return res.status(200).json(LIST);
  }

  if (req.method === 'POST') {
    try {
      const { nome, telefone, data, servico, observacoes } = req.body || {};
      if (!nome || !telefone || !data || !servico) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, telefone, data, servico' });
      }
      const id = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      const item = {
        id,
        nome,
        telefone,
        data,
        servico,
        observacoes: observacoes || '',
        createdAt: new Date().toISOString(),
      };
      LIST.push(item);
      return res.status(201).json(item);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar agendamento' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
