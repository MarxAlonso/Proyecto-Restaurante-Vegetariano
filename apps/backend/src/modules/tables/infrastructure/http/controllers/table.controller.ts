import { Request, Response } from 'express';
import { TableService } from '../../../application/table.service';

export class TableController {
  constructor(private tableService: TableService) {}

  async getAll(_req: Request, res: Response) {
    try {
      const tables = await this.tableService.getAllTables();
      res.json(tables);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAvailable(_req: Request, res: Response) {
    try {
      const tables = await this.tableService.getAvailableTables();
      res.json(tables);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const table = await this.tableService.getTableById(req.params.id);
      if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDetails(req: Request, res: Response) {
    try {
      const details = await this.tableService.getTableDetails(req.params.id);
      if (!details) return res.status(404).json({ error: 'Mesa no encontrada' });
      res.json(details);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { number, capacity } = req.body;
      const table = await this.tableService.createTable({ number, capacity });
      res.status(201).json(table);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { number, capacity } = req.body;
      const table = await this.tableService.updateTable(req.params.id, { number, capacity });
      res.json(table);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const table = await this.tableService.updateTableStatus(req.params.id, status);
      res.json(table);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.tableService.deleteTable(req.params.id);
      res.json({ message: 'Mesa eliminada exitosamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
