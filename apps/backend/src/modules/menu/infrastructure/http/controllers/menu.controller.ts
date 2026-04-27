import { Request, Response } from 'express';
import { MenuService } from '../../../application/menu.service.js';

export class MenuController {
  constructor(private menuService: MenuService) {}

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.menuService.getAllItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.menuService.getItemById(req.params.id as string);
      res.json(item);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await this.menuService.createItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await this.menuService.updateItem(req.params.id as string, req.body);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.menuService.deleteItem(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
