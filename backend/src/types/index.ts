export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin' | 'kitchen';
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'drink';
  image?: string;
  available: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface AuthRequest extends Express.Request {
  user?: User;
}