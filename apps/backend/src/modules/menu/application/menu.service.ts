import { MenuItemRepository } from '../domain/menu-item.repository.js';


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

  async createItem(data: any) {
    return this.menuItemRepository.save({
      ...data,
      category: data.category.toUpperCase(),
    });
  }

  async updateItem(id: string, data: any) {
    return this.menuItemRepository.update(id, data);
  }

  async deleteItem(id: string) {
    return this.menuItemRepository.delete(id);
  }
}
