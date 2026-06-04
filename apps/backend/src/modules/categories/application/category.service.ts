import { CategoryRepository } from '../domain/category.repository';

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAll() {
    return this.categoryRepository.findAll();
  }

  async getById(id: string) {
    const cat = await this.categoryRepository.findById(id);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  async create(data: { name: string; description?: string }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) throw new Error('Ya existe una categoría con ese nombre');

    return this.categoryRepository.save({
      name: data.name,
      slug,
      description: data.description || null,
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new Error('Category not found');

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const slugExists = await this.categoryRepository.findBySlug(slug);
      if (slugExists && slugExists.id !== id) {
        throw new Error('Ya existe una categoría con ese nombre');
      }
    }

    return this.categoryRepository.update(id, {
      name: data.name,
      slug,
      description: data.description,
    });
  }

  async delete(id: string) {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) throw new Error('Category not found');
    return this.categoryRepository.delete(id);
  }
}
