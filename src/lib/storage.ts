export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  carModel: string;
  carSize: 'sedan' | 'suv' | 'caminhonete';
  serviceType: string;
  waxApplication: boolean;
  date: string;
  time: string;
  status: 'pendente' | 'confirmado' | 'finalizado';
  totalValue: number;
  createdAt: string;
}

const STORAGE_KEY = 'carlach_bookings';

export const getBookings = (): Booking[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    return [];
  }
};

export const saveBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(),
    status: 'pendente',
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
};

export const updateBookingStatus = (id: string, status: Booking['status']): Booking | null => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index].status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return bookings[index];
};

export const updateBooking = (id: string, updates: Partial<Booking>): Booking | null => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index] = { ...bookings[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return bookings[index];
};

export const deleteBooking = (id: string): boolean => {
  const bookings = getBookings();
  const filtered = bookings.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered.length < bookings.length;
};

export const getBookedTimesForDate = (date: string): string[] => {
  const bookings = getBookings();
  return bookings
    .filter(b => b.date === date)
    .map(b => b.time);
};

export const isTimeAvailable = (date: string, time: string): boolean => {
  const bookedTimes = getBookedTimesForDate(date);
  return !bookedTimes.includes(time);
};
