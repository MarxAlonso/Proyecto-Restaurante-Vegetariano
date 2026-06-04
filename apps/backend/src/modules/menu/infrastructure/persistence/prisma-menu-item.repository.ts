import { MenuItemRepository } from '../../domain/menu-item.repository';
import { MenuItemEntity } from '../../domain/menu-item.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

export class PrismaMenuItemRepository implements MenuItemRepository {
  async findAll(): Promise<MenuItemEntity[]> {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return items as any as MenuItemEntity[];
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });
    return item as any as MenuItemEntity | null;
  }

  async save(item: Omit<MenuItemEntity, 'id' | 'createdAt'>): Promise<MenuItemEntity> {
    const created = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price as any,
        categoryId: item.categoryId,
        image: item.image,
        available: item.available,
      },
      include: { category: true },
    });
    return created as any as MenuItemEntity;
  }

  async update(id: string, item: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
    const data: any = {};
    if (item.name !== undefined) data.name = item.name;
    if (item.description !== undefined) data.description = item.description;
    if (item.price !== undefined) data.price = item.price as any;
    if (item.categoryId !== undefined) data.categoryId = item.categoryId;
    if (item.image !== undefined) data.image = item.image;
    if (item.available !== undefined) data.available = item.available;

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });
    return updated as any as MenuItemEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.menuItem.delete({ where: { id } });
  }

  async findCategoryIdBySlug(slug: string): Promise<string | null> {
    const cat = await prisma.category.findUnique({ where: { slug } });
    return cat?.id || null;
  }
}
