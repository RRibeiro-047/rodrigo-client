import { Booking } from './storage';

export const sendWhatsAppMessage = (phone: string, message: string) => {
  // Remove caracteres não numéricos do telefone
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Adiciona o código do país se não tiver (assumindo Brasil +55)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  // Codifica a mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Abre o WhatsApp Web/App
  const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export const sendConfirmationMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, Seu agendamento está Confirmado para ${booking.date} às ${booking.time}. Nos vemos em breve, Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};

export const sendCompletionMessage = (booking: Booking) => {
  const message = `Olá ${booking.clientName}, seu carro está pronto para retirada. Obrigado por confiar na Carlach Detailing!`;
  sendWhatsAppMessage(booking.phone, message);
};
