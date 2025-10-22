import { Booking } from './storage';

export const sendWhatsAppMessage = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  
  // Usar WhatsApp Business API ou fallback para web
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Função para tentar abrir o WhatsApp com diferentes métodos
  const openWhatsApp = () => {
    // Método 1: Tentar abrir em nova aba
    try {
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (win && !win.closed) {
        return true;
      }
    } catch (error) {
      console.log('Método 1 falhou:', error);
    }

    // Método 2: Criar link temporário
    try {
      const a = document.createElement('a');
      a.href = whatsappUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (error) {
      console.log('Método 2 falhou:', error);
    }

    // Método 3: Usar location.href como último recurso
    try {
      window.location.href = whatsappUrl;
      return true;
    } catch (error) {
      console.log('Método 3 falhou:', error);
    }

    return false;
  };

  // Tentar abrir com delay para evitar rate limiting
  setTimeout(() => {
    const success = openWhatsApp();
    if (!success) {
      // Fallback: copiar número para área de transferência
      navigator.clipboard.writeText(fullPhone).then(() => {
        alert(`Não foi possível abrir o WhatsApp automaticamente. O número ${fullPhone} foi copiado para a área de transferência.`);
      }).catch(() => {
        alert(`Não foi possível abrir o WhatsApp. Número: ${fullPhone}`);
      });
    }
  }, 100);
};

export const sendConfirmationMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, Seu agendamento está Confirmado para ${booking.date} às ${booking.time}. Nos vemos em breve, Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};

export const sendCompletionMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, seu carro está pronto para retirada. Obrigado por confiar na Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};