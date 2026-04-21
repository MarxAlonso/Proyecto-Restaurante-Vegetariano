import { MenuItemRepository } from '../../domain/menu-item.repository.js';
import { MenuItemEntity } from '../../domain/menu-item.entity.js';
import prisma from '../../../../infrastructure/persistence/prisma.client.js';

export class PrismaMenuItemRepository implements MenuItemRepository {
  async findAll(): Promise<MenuItemEntity[]> {
    const items = await prisma.menuItem.findMany();
    return items as any as MenuItemEntity[];
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });
    return item as any as MenuItemEntity | null;
  }

  async save(item: Omit<MenuItemEntity, 'id' | 'createdAt'>): Promise<MenuItemEntity> {
    const created = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price as any,
        category: item.category as any,
        image: item.image,
        available: item.available,
      },
    });
    return created as any as MenuItemEntity;
  }

  async update(id: string, item: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        ...item,
        price: item.price !== undefined ? (item.price as any) : undefined,
        category: item.category ? (item.category as any) : undefined,
      },
    });
    return updated as any as MenuItemEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.menuItem.delete({
      where: { id },
    });
  }
}
