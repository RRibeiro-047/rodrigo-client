import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const APPOINTMENTS_KEY = 'appointments';

// Função para gerar ID único
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default async function handler(req, res) {
  // CORS headers
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method === 'GET') {
      const appointments = await redis.get(APPOINTMENTS_KEY) || [];
      return res.status(200).json(appointments);
    }

    if (req.method === 'POST') {
      const { nome, telefone, data, servico, observacoes } = req.body || {};
      
      if (!nome || !telefone || !data || !servico) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: nome, telefone, data, servico' 
        });
      }

      const appointments = await redis.get(APPOINTMENTS_KEY) || [];
      
      const newAppointment = {
        id: generateId(), // Corrigido: usando função própria
        nome,
        telefone,
        data,
        servico,
        observacoes: observacoes || '',
        createdAt: new Date().toISOString(),
      };

      appointments.push(newAppointment);
      await redis.set(APPOINTMENTS_KEY, appointments);

      return res.status(201).json(newAppointment);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (req.body && req.body.id);
      
      if (!id) {
        return res.status(400).json({ error: 'Informe o id para excluir' });
      }

      const appointments = await redis.get(APPOINTMENTS_KEY) || [];
      const filteredAppointments = appointments.filter(item => item.id !== id);
      
      if (filteredAppointments.length === appointments.length) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      await redis.set(APPOINTMENTS_KEY, filteredAppointments);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
