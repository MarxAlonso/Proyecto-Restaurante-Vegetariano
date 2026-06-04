import { MenuItemRepository } from '../domain/menu-item.repository';
import { uploadToR2, deleteFromR2 } from '../../../infrastructure/services/r2.service';

export class MenuService {
  constructor(private menuItemRepository: MenuItemRepository) { }

  async getAllItems() {
    return this.menuItemRepository.findAll();
  }

  async getItemById(id: string) {
    const item = await this.menuItemRepository.findById(id);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }

  async createItem(data: any, file?: Express.Multer.File) {
    let image: string | undefined;
    if (file) {
      image = await uploadToR2(file);
    }

    return this.menuItemRepository.save({
      name: data.name,
      description: data.description,
      price: Number(data.price),
      categoryId: data.categoryId,
      image: image || null,
      available: data.available !== undefined ? data.available === 'true' || data.available === true : true,
    });
  }

  async updateItem(id: string, data: any, file?: Express.Multer.File) {
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) throw new Error('Menu item not found');

    let image = existing.image;
    if (file) {
      if (existing.image) {
        await deleteFromR2(existing.image).catch(() => {});
      }
      image = await uploadToR2(file);
    }

    return this.menuItemRepository.update(id, {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      categoryId: data.categoryId ?? existing.categoryId,
      image: image ?? existing.image,
      available: data.available !== undefined
        ? (data.available === 'true' || data.available === true)
        : existing.available,
    });
  }

  async deleteItem(id: string) {
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) throw new Error('Menu item not found');

    if (existing.image) {
      await deleteFromR2(existing.image).catch(() => {});
    }

    return this.menuItemRepository.delete(id);
  }
}
