export interface MenuItemEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'APPETIZER' | 'MAIN' | 'DESSERT' | 'DRINK';
  image?: string | null;
  available: boolean;
  createdAt: Date;
}
