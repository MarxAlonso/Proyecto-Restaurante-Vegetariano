import { MenuItemRepository } from '../../domain/menu-item.repository';
import { MenuItemEntity } from '../../domain/menu-item.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';
import { Prisma } from '@prisma/client';

type MenuItemWithCategory = Prisma.MenuItemGetPayload<{
  include: { category: true };
}>;

function toMenuItemEntity(item: MenuItemWithCategory): MenuItemEntity {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    categoryId: item.categoryId,
    category: item.category,
    image: item.image,
    available: item.available,
    createdAt: item.createdAt,
  };
}

export class PrismaMenuItemRepository implements MenuItemRepository {
  async findAll(): Promise<MenuItemEntity[]> {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(toMenuItemEntity);
  }

  async findById(id: string): Promise<MenuItemEntity | null> {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });
    return item ? toMenuItemEntity(item) : null;
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
    return toMenuItemEntity(created);
  }

  async update(id: string, item: Partial<MenuItemEntity>): Promise<MenuItemEntity> {
    const data: Prisma.MenuItemUpdateInput = {};
    if (item.name !== undefined) data.name = item.name;
    if (item.description !== undefined) data.description = item.description;
    if (item.price !== undefined) data.price = item.price as any;
    if (item.categoryId !== undefined) data.category = { connect: { id: item.categoryId } };
    if (item.image !== undefined) data.image = item.image;
    if (item.available !== undefined) data.available = item.available;

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });
    return toMenuItemEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.menuItem.delete({ where: { id } });
  }

  async findCategoryIdBySlug(slug: string): Promise<string | null> {
    const cat = await prisma.category.findUnique({ where: { slug } });
    return cat?.id || null;
  }
}
