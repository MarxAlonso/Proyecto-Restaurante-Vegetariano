import { MenuItemEntity } from './menu-item.entity.js';

export interface MenuItemRepository {
  findAll(): Promise<MenuItemEntity[]>;
  findById(id: string): Promise<MenuItemEntity | null>;
  save(item: Omit<MenuItemEntity, 'id' | 'createdAt'>): Promise<MenuItemEntity>;
  update(id: string, item: Partial<MenuItemEntity>): Promise<MenuItemEntity>;
  delete(id: string): Promise<void>;
}
