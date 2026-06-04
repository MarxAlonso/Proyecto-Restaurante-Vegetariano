import { CategoryRepository } from '../../domain/category.repository';
import { CategoryEntity } from '../../domain/category.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

export class PrismaCategoryRepository implements CategoryRepository {
  async findAll(): Promise<CategoryEntity[]> {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { menuItems: true } } },
      orderBy: { name: 'asc' },
    });
    return cats as any as CategoryEntity[];
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { menuItems: true } } },
    });
    return cat as any as CategoryEntity | null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { menuItems: true } } },
    });
    return cat as any as CategoryEntity | null;
  }

  async save(item: Omit<CategoryEntity, 'id' | 'createdAt' | '_count'>): Promise<CategoryEntity> {
    const created = await prisma.category.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
      },
      include: { _count: { select: { menuItems: true } } },
    });
    return created as any as CategoryEntity;
  }

  async update(id: string, item: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
      },
      include: { _count: { select: { menuItems: true } } },
    });
    return updated as any as CategoryEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
