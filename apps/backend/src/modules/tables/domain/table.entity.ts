export interface TableEntity {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  createdAt: Date;
}
