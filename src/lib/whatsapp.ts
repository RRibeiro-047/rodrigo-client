import { Booking } from './storage';

export const sendWhatsAppMessage = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Tentar WhatsApp Desktop primeiro (mais confiável)
  const desktopUrl = `whatsapp://send?phone=${fullPhone}&text=${encodedMessage}`;
  const webUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  const tryOpenWhatsApp = () => {
    // Método 1: Tentar WhatsApp Desktop
    try {
      window.location.href = desktopUrl;
      return true;
    } catch (error) {
      console.log('WhatsApp Desktop não disponível');
    }

    // Método 2: Tentar WhatsApp Web
    try {
      const win = window.open(webUrl, '_blank', 'noopener,noreferrer');
      if (win && !win.closed) {
        return true;
      }
    } catch (error) {
      console.log('WhatsApp Web falhou');
    }

    // Método 3: Fallback com link temporário
    try {
      const a = document.createElement('a');
      a.href = webUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (error) {
      console.log('Fallback falhou');
    }

    return false;
  };

  // Executar com delay para evitar rate limiting
  setTimeout(() => {
    const success = tryOpenWhatsApp();
    if (!success) {
      // Último recurso: mostrar número para copiar
      const copyText = `Número: ${fullPhone}\nMensagem: ${decodeURIComponent(encodedMessage)}`;
      navigator.clipboard.writeText(copyText).then(() => {
        alert('WhatsApp não pôde ser aberto. As informações foram copiadas para a área de transferência.');
      }).catch(() => {
        alert(`WhatsApp não disponível. Número: ${fullPhone}`);
      });
    }
  }, 200);
};

export const sendConfirmationMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, Seu agendamento está Confirmado para ${booking.date} às ${booking.time}. Nos vemos em breve, Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};

export const sendCompletionMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, seu carro está pronto para retirada. Obrigado por confiar na Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};
