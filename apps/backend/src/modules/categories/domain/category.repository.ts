import { CategoryEntity } from './category.entity';

export interface CategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  save(item: Omit<CategoryEntity, 'id' | 'createdAt' | '_count'>): Promise<CategoryEntity>;
  update(id: string, item: Partial<CategoryEntity>): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
}
