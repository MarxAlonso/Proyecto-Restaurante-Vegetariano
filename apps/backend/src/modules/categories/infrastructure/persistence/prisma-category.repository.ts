import { CategoryRepository } from '../../domain/category.repository';
import { CategoryEntity } from '../../domain/category.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';
import { Prisma } from '@prisma/client';

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { menuItems: true } } };
}>;

function toCategoryEntity(cat: CategoryWithCount): CategoryEntity {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    createdAt: cat.createdAt,
    _count: { menuItems: cat._count.menuItems },
  };
}

export class PrismaCategoryRepository implements CategoryRepository {
  async findAll(): Promise<CategoryEntity[]> {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { menuItems: true } } },
      orderBy: { name: 'asc' },
    });
    return cats.map(toCategoryEntity);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { menuItems: true } } },
    });
    return cat ? toCategoryEntity(cat) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { menuItems: true } } },
    });
    return cat ? toCategoryEntity(cat) : null;
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
    return toCategoryEntity(created);
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
    return toCategoryEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
