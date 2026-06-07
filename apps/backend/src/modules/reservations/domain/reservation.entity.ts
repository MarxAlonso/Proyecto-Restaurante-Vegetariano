export interface ReservationEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  guests: number;
  tableId: string;
  table?: { id: string; number: number; capacity: number };
  specialRequests?: string | null;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: Date;
}
