// Simple API client for backend integration
// Uses optional VITE_API_BASE_URL to point to production API.

export interface ApiAgendamento {
  id: string;
  nome: string;
  telefone: string;
  data: string; // ISO or 'YYYY-MM-DDTHH:mm:ss'
  servico: string;
  observacoes?: string;
  createdAt?: string;
}

const BASE_RAW = (import.meta as any).env?.VITE_API_BASE_URL ?? "";
const BASE = BASE_RAW ? BASE_RAW.replace(/\/+$/, "") : "";

export async function apiCreateAgendamento(payload: Omit<ApiAgendamento, "id" | "createdAt">): Promise<ApiAgendamento> {
  const res = await fetch(`${BASE}/api/agendamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao criar agendamento: ${res.status} ${text}`);
  }
  return res.json();
}

export async function apiListAgendamentos(): Promise<ApiAgendamento[]> {
  const res = await fetch(`${BASE}/api/agendamentos`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao listar agendamentos: ${res.status} ${text}`);
  }
  return res.json();
}

export async function apiDeleteAgendamento(id: string): Promise<void> {
  const url = `${BASE}/api/agendamentos?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao excluir agendamento: ${res.status} ${text}`);
  }
}
