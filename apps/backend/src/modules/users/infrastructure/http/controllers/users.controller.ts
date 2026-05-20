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
      const users = await this.usersService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
