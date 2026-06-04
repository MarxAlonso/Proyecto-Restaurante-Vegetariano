export interface MenuItemEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  image?: string | null;
  available: boolean;
  createdAt: Date;
}
