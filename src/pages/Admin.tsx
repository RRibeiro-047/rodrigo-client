import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles } from 'lucide-react';
import { isAuthenticated, logout, getUsername } from '@/lib/auth';
import Dashboard from '@/components/Dashboard';
import { toast } from '@/hooks/use-toast';
import Logo from '@/assets/LOGO-2.png';

const Admin = () => {
  const navigate = useNavigate();
  const username = getUsername();

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: 'Acesso negado',
        description: 'Você precisa fazer login para acessar esta página.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!',
    });
    navigate('/');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Logo Carlach Detailing" className='w-100 h-100 mx-auto' />
                <p className="text-sm text-muted-foreground">Painel Administrativo</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Logado como</p>
                <p className="font-semibold text-foreground">{username}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-border hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2025 Carlach Detailing - Painel Administrativo</p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
