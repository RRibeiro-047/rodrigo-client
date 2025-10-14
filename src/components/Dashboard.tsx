import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { Booking } from '@/lib/storage';
import { apiListAgendamentos } from '@/lib/api';
import BookingCard from './BookingCard';

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pendente' | 'confirmado' | 'finalizado'>('all');

  const parseFromObservacoes = (obs?: string) => {
    const result: { carModel?: string; carSize?: 'sedan' | 'suv' | 'caminhonete'; totalValue?: number } = {};
    if (!obs) return result;
    const modelMatch = obs.match(/Modelo:\s*([^|]+)/i);
    if (modelMatch) result.carModel = modelMatch[1].trim();
    const sizeMatch = obs.match(/Tamanho:\s*([A-Z]+)/i);
    if (sizeMatch) {
      const s = sizeMatch[1].toLowerCase();
      if (s === 'sedan' || s === 'suv' || s === 'caminhonete') result.carSize = s as any;
    }
    const totalMatch = obs.match(/Total:\s*R\$\s*([0-9]+[\.,]?[0-9]*)/i);
    if (totalMatch) result.totalValue = parseFloat(totalMatch[1].replace(',', '.'));
    return result;
  };

  const loadBookings = async () => {
    try {
      const apiItems = await apiListAgendamentos();
      const mapped: Booking[] = apiItems.map((a) => {
        // data/time
        const dt = new Date(a.data);
        const date = isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
        const time = isNaN(dt.getTime()) ? '' : dt.toISOString().slice(11, 16);
        const fromObs = parseFromObservacoes(a.observacoes);
        return {
          id: a.id,
          clientName: a.nome,
          phone: a.telefone,
          carModel: fromObs.carModel ?? '-',
          carSize: fromObs.carSize ?? 'sedan',
          serviceType: a.servico,
          waxApplication: /cera/i.test(a.servico),
          date,
          time,
          status: 'pendente',
          totalValue: fromObs.totalValue ?? 0,
          createdAt: a.createdAt ?? new Date().toISOString(),
        };
      });
      setBookings(mapped);
    } catch (e) {
      // fallback vazio em caso de erro
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.carModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || booking.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = bookings.filter(b => b.status === 'pendente').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Dashboard de Agendamentos
          </h2>
          {pendingCount > 0 && (
            <Badge className="mt-2 bg-primary text-primary-foreground animate-glow">
              {pendingCount} Pendente{pendingCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pendente')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pendente'
                ? 'bg-yellow-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('confirmado')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'confirmado'
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFilter('finalizado')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'finalizado'
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Finalizados
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou modelo do carro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchTerm || filter !== 'all' 
              ? 'Nenhum agendamento encontrado.' 
              : 'Nenhum agendamento ainda. Crie o primeiro!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdate={loadBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
