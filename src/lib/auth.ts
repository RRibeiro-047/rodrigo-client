// NOTA DE SEGURANÇA: Esta é uma implementação básica para demonstração.
// Para produção, use Lovable Cloud com autenticação real do Supabase.

const ADMIN_CREDENTIALS = {
  username: 'carlach',
  password: 'adminrodrigo2025'
};

const SESSION_KEY = 'carlach_admin_session';

export const login = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const session = {
      authenticated: true,
      timestamp: Date.now(),
      username: username
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = (): boolean => {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return false;
    
    const parsed = JSON.parse(session);
    // Sessão expira após 8 horas
    const eightHours = 8 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > eightHours) {
      logout();
      return false;
    }
    
    return parsed.authenticated === true;
  } catch {
    return false;
  }
};

export const getUsername = (): string | null => {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed.username || null;
  } catch {
    return null;
  }
};
