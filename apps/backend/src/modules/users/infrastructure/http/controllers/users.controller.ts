import { Request, Response } from 'express';
import { UsersService } from '../../../application/users.service';

export class UsersController {
  constructor(private usersService: UsersService) {}

  async createWorker(req: Request, res: Response) {
    try {
      const user = await this.usersService.createWorker(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const role = typeof req.query.role === 'string' ? req.query.role : undefined;
      const users = await this.usersService.getAllUsers(role);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await this.usersService.updateUser(req.params.id as string, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.usersService.deleteUser(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
