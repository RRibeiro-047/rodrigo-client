# Carlach Detailing — Sistema de Agendamentos

Aplicação web para agendamento de serviços de estética automotiva, com painel administrativo para gestão de agendamentos.

## ✨ Funcionalidades
- **Agendamento online**: formulário com serviços, tamanho do veículo, aplicação de cera, data e horários disponíveis (`src/components/BookingForm.tsx`).
- **Dashboard Admin**: listagem, busca e filtros por status (pendente, confirmado, finalizado) (`src/components/Dashboard.tsx`).
- **Autenticação simples**: login básico de demonstração para acesso ao painel (`src/lib/auth.ts`, `src/pages/Login.tsx`).
- **UI moderna**: Tailwind CSS + shadcn-ui + ícones Lucide, com animações.

## 🧱 Stack e Arquitetura
- Vite + React + TypeScript
- Tailwind CSS + shadcn-ui
- React Router DOM (rotas: `/`, `/login`, `/admin`)
- Alias `@` → `src/` (ver `vite.config.ts`)
- Persistência atual: `localStorage` (ver `src/lib/storage.ts`)

## 🚦 Limitação importante (dados)
Atualmente os agendamentos ficam no `localStorage` do navegador. Portanto:
- Agendamentos feitos em um dispositivo NÃO aparecem automaticamente em outro.
- Para produção, integre com um backend/BD compartilhado (ver Roteiro abaixo).

## ▶️ Como rodar localmente
1. Pré-requisito: Node.js 18+
2. Instalar dependências:
   ```bash
   npm i
   ```
3. Rodar em desenvolvimento (porta 8080):
   ```bash
   npm run dev
   ```
4. Acessar: http://localhost:8080

Scripts (package.json):
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção para `dist/`
- `npm run preview` — pré-visualização do build
- `npm run lint` — lint do projeto

## 🔐 Acesso Administrativo
- Rota de login: `/login` → redireciona para `/admin` após sucesso.
- Credenciais de demonstração (definidas em `src/lib/auth.ts`):
  - Usuário: `carlach`
  - Senha: `adminrodrigo2025`
- Observação: autenticação apenas para testes (usa `sessionStorage`). Para produção use um provedor real (ex.: Supabase Auth).

## 📁 Estrutura principal
- `src/pages/Index.tsx` — página pública com formulário de agendamento
- `src/pages/Login.tsx` — tela de login admin
- `src/pages/Admin.tsx` — painel administrativo
- `src/components/BookingForm.tsx` — formulário (criação de agendamento)
- `src/components/Dashboard.tsx` — listagem/filtros de agendamentos
- `src/lib/storage.ts` — CRUD no `localStorage`
- `src/lib/auth.ts` — autenticação básica via `sessionStorage`
- `src/assets/LOGO-2.png` — logomarca utilizada no header

## 🧩 Configurações
- Vite: alias `@` → `src/` (`vite.config.ts`)
- Tailwind: `tailwind.config.ts` com animações utilitárias

## 🚀 Deploy
1. Gerar build de produção:
   ```bash
   npm run build
   ```
2. Publicar a pasta `dist/` em um host estático (Netlify, Vercel, Cloudflare Pages, etc.).
3. Importante: como os dados estão no `localStorage`, cada navegador verá apenas seus próprios agendamentos.

## 🗺️ Roteiro para produção (dados compartilhados entre dispositivos)
Para que os agendamentos sejam visíveis em qualquer dispositivo:
1. Substituir `src/lib/storage.ts` por integração com backend/BD.
2. Opções recomendadas:
   - Supabase (PostgreSQL + API + Auth) — rápido de implementar
   - Firebase Firestore — simples e escalável
   - API Node/Express + PostgreSQL/Mongo — controle total
3. Endpoints típicos:
   - `POST /bookings` — criar agendamento
   - `GET /bookings` — listar agendamentos
   - `PATCH /bookings/:id` — atualizar status/dados
   - `DELETE /bookings/:id` — remover
4. Opcional: migrar agendamentos existentes do `localStorage` para o backend no primeiro acesso do admin.

## 🧪 Teste rápido
1. Acesse `/` e crie um agendamento.
2. Entre em `/login` com as credenciais acima.
3. No `/admin`, visualize, busque e filtre os agendamentos.

## 📣 Créditos
Desenvolvido para Carlach Detailing. UI com Tailwind + shadcn-ui. Ícones Lucide.