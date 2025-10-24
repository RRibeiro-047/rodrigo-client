import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { Booking } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import Logo from '@/assets/LOGO-2.png';

const Index = () => {
  const navigate = useNavigate();
  const [bookingCreated, setBookingCreated] = useState(false);

  const handleBookingCreated = (booking: Booking) => {
    setBookingCreated(true);
    toast({
      title: 'Agendamento Criado!',
      description: 'Entraremos em contato em breve para confirmar.',
    });
    
    // Reset após 3 segundos para permitir novo agendamento
    setTimeout(() => {
      setBookingCreated(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <img src={Logo} alt="Logo Carlach Detailing" className='w-100 h-100 mx-auto' />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Agende Seu Serviço
            </h2>
            <p className="text-lg text-muted-foreground">
              Preencha o formulário abaixo e entraremos em contato para confirmar seu agendamento
            </p>
          </div>

          <BookingForm onBookingCreated={handleBookingCreated} />

          {bookingCreated && (
            <div className="mt-6 p-6 bg-primary/10 border border-primary rounded-lg text-center animate-scale-in">
              <p className="text-primary font-semibold text-lg">
                ✓ Agendamento realizado com sucesso!
              </p>
              <p className="text-muted-foreground mt-2">
                Em breve entraremos em contato para confirmar.
              </p>
            </div>
          )}
        </div>
      </main>

      

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2025 Carlach Detailing - Todos os direitos reservados</p>
          <p className="text-sm mt-2">Segunda a Sexta - 08:00 às 18:00</p>
          <p className="text-sm mt-2">Sábado - 08:00 às 16:30</p>
          
      <div className="bottom-6 right-6 p-5">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          size="sm"
          className="border-border bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg"
        >
          <Shield className="w-4 h-4 mr-2" />
          Acesso Admin
        </Button>
      </div>
        </div>
      </footer>
    </div>
  );
};


export default Index;
