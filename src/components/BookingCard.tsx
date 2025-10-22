import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Car, Phone, DollarSign, Trash2, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { Booking } from '@/lib/storage';
import { apiDeleteAgendamento, apiUpdateAgendamentoStatus } from '@/lib/api';
import { sendConfirmationMessage, sendCompletionMessage } from '@/lib/whatsapp';
import { toast } from '@/hooks/use-toast';

interface BookingCardProps {
  booking: Booking;
  onUpdate: () => void;
}

const BookingCard = ({ booking, onUpdate }: BookingCardProps) => {
  const [status, setStatus] = useState(booking.status);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincroniza o status quando o booking muda
  useEffect(() => {
    setStatus(booking.status);
  }, [booking.status]);

  const handleStatusChange = async (newStatus: Booking['status']) => {
    if (isUpdating) return; // Previne múltiplos cliques
    
    setIsUpdating(true);
    
    try {
      // Atualiza no banco de dados primeiro
      await apiUpdateAgendamentoStatus(booking.id, newStatus);
      
      // Atualiza o estado local
    setStatus(newStatus);

      // Envia mensagens do WhatsApp com delay para garantir que a janela abra
    if (newStatus === 'confirmado') {
        // Pequeno delay para garantir que o status foi salvo
        setTimeout(() => {
          try {
      sendConfirmationMessage(booking);
          } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
          }
        }, 300);
        
      toast({
          title: '✅ Status Atualizado',
          description: 'WhatsApp será aberto para enviar confirmação ao cliente.',
      });
    } else if (newStatus === 'finalizado') {
        // Pequeno delay para garantir que o status foi salvo
        setTimeout(() => {
          try {
      sendCompletionMessage(booking);
          } catch (error) {
            console.error('Erro ao abrir WhatsApp:', error);
          }
        }, 300);
        
        toast({
          title: '🎉 Agendamento Finalizado',
          description: 'WhatsApp será aberto para enviar mensagem de conclusão.',
        });
      } else {
        toast({
          title: 'Status Atualizado',
          description: `Status alterado para ${newStatus}.`,
        });
      }

      // Recarrega os dados
      onUpdate();
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente mais tarde.';
      toast({
        title: 'Erro ao atualizar status',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiDeleteAgendamento(booking.id);
      toast({
        title: 'Agendamento Excluído',
        description: 'O agendamento foi removido com sucesso.',
      });
      onUpdate();
    } catch (e: unknown) {
      console.error('Erro ao excluir agendamento:', e);
      const errorMessage = e instanceof Error ? e.message : 'Tente novamente mais tarde.';
      toast({
        title: 'Erro ao excluir',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmado':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'finalizado':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return '';
    }
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-scale-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2">{booking.clientName}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <span>{booking.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="w-4 h-4 text-primary" />
              <span>{booking.carModel} - {booking.carSize.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <Badge className={`${getStatusColor(status)} font-semibold`}>
          {status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="font-medium">{booking.serviceType}</span>
        </div>
        
        {booking.waxApplication && (
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Com aplicação de cera</span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>{booking.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <DollarSign className="w-5 h-5" />
          <span>R$ {booking.totalValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Select 
          value={status} 
          onValueChange={(value: Booking['status']) => handleStatusChange(value)}
          disabled={isUpdating}
        >
          <SelectTrigger className="flex-1 bg-input border-border">
            <SelectValue />
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Confirmado
              </div>
            </SelectItem>
            <SelectItem value="finalizado">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Finalizado
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isUpdating}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

export default BookingCard;
