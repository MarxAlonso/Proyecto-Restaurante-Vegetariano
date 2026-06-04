export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
  _count?: { menuItems: number };
}
