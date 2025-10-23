import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Car, Phone, User, AlertCircle } from 'lucide-react';
import { Booking } from '@/lib/storage';
import { apiCreateAgendamento, apiListAgendamentos } from '@/lib/api';
import { calculateTotal, getAvailableServices } from '@/lib/pricing';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingFormProps {
  onBookingCreated: (booking: Booking) => void;
}

const AVAILABLE_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const BookingForm = ({ onBookingCreated }: BookingFormProps) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carSize, setCarSize] = useState<'sedan' | 'suv' | 'caminhonete'>('sedan');
  const [serviceType, setServiceType] = useState('');
  const [waxApplication, setWaxApplication] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const availableServices = getAvailableServices(carSize);
  const totalValue = serviceType ? calculateTotal(serviceType, carSize, waxApplication) : 0;

  // Atualiza horários ocupados quando a data mudar (via API, preservando horário selecionado pelo cliente)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!date) {
        setBookedTimes([]);
        return;
      }
      try {
        const items = await apiListAgendamentos();
        const times = items
          .filter((a) => typeof a.data === 'string' && a.data.slice(0, 10) === date)
          .map((a) => a.data.slice(11, 16));
        if (!cancelled) {
          setBookedTimes(times);
          if (time && times.includes(time)) {
            setTime('');
          }
        }
      } catch {
        if (!cancelled) setBookedTimes([]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [date, time]);

  // Filtra horários disponíveis
  const availableHours = AVAILABLE_HOURS.filter(hour => !bookedTimes.includes(hour));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !phone || !carModel || !serviceType || !date || !time) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    // Envia para o backend
    try {
      const isoDateTime = `${date}T${time}:00`;
      await apiCreateAgendamento({
        nome: clientName,
        telefone: phone,
        data: isoDateTime,
        servico: serviceType + (waxApplication ? ' + Cera' : ''),
        observacoes: `Modelo: ${carModel} | Tamanho: ${carSize.toUpperCase()} | Total: R$ ${totalValue.toFixed(2)}`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Erro ao enviar agendamento',
        description: err instanceof Error ? err.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Agendamento Criado!',
      description: `Agendamento para ${clientName} confirmado com sucesso.`,
    });

    // Cria um objeto local apenas para feedback imediato da UI
    const localBooking: Booking = {
      id: Date.now().toString(),
      clientName,
      phone,
      carModel,
      carSize,
      serviceType,
      waxApplication,
      date,
      time,
      totalValue,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };

    onBookingCreated(localBooking);

    // Reset form
    setClientName('');
    setPhone('');
    setCarModel('');
    setCarSize('sedan');
    setServiceType('');
    setWaxApplication(false);
    setDate('');
    setTime('');
  };

  return (
    <Card className="p-6 sm:p-8 bg-card border-border animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Nome do Cliente *
          </Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Digite o nome completo"
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Telefone (WhatsApp) *
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(47) 99999-9999"
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carModel" className="flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            Modelo do Carro *
          </Label>
          <Input
            id="carModel"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="Ex: Honda Civic"
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carSize">Tamanho do Veículo *</Label>
          <Select value={carSize} onValueChange={(value: 'sedan' | 'suv' | 'caminhonete') => {
            setCarSize(value);
            setServiceType(''); // Reset service when car size changes
          }}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="sedan">Hatch/Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="caminhonete">Caminhonete/7Lugares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceType">Tipo de Serviço *</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {availableServices.map((service) => (
                <SelectItem key={service.name} value={service.name}>
                  {service.name} - R$ {service.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
          <Switch
            id="wax"
            checked={waxApplication}
            onCheckedChange={setWaxApplication}
          />
          <Label htmlFor="wax" className="cursor-pointer">
            Aplicação de Cera (+R$ {carSize === 'sedan' ? 40 : carSize === 'suv' ? 50 : 60})
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border-border"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Horário *
            </Label>
            <Select value={time} onValueChange={setTime} disabled={!date}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder={date ? "Selecione o horário" : "Selecione a data primeiro"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableHours.length > 0 ? (
                  availableHours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground text-sm">
                    Nenhum horário disponível
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {date && bookedTimes.length > 0 && (
          <Alert className="bg-muted border-border">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              {bookedTimes.length === AVAILABLE_HOURS.length ? (
                <span className="text-destructive font-medium">
                  Todos os horários estão ocupados para este dia. Por favor, escolha outra data.
                </span>
              ) : (
                <>
                  <span className="font-medium text-foreground">Horários ocupados neste dia:</span>
                  <span className="ml-2 text-muted-foreground">
                    {bookedTimes.sort().join(', ')}
                  </span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {totalValue > 0 && (
          <div className="p-4 bg-primary/10 border border-primary rounded-lg">
            <p className="text-lg font-semibold text-primary">
              Valor Total: R$ {totalValue.toFixed(2)}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
        >
          Confirmar Agendamento
        </Button>
      </form>
    </Card>
  );
};

export default BookingForm;
