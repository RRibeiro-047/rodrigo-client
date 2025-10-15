import { Booking } from './storage';

export const sendWhatsAppMessage = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const win = window.open(whatsappUrl, '_blank', 'noopener');
    if (win) return;
  } catch {}

  try {
    const a = document.createElement('a');
    a.href = whatsappUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  } catch {}

  try {
    window.location.href = whatsappUrl;
  } catch {}
};

export const sendConfirmationMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, Seu agendamento está Confirmado para ${booking.date} às ${booking.time}. Nos vemos em breve, Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};

export const sendCompletionMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, seu carro está pronto para retirada. Obrigado por confiar na Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};
