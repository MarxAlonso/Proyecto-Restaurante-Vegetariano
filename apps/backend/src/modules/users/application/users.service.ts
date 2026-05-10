import bcrypt from 'bcryptjs';
import prisma from '../../../infrastructure/persistence/prisma.client.js';

export class UsersService {
  async createWorker(data: any) {
    const { email, password, name, role } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    if (!['ADMIN', 'KITCHEN'].includes(role)) {
      throw new Error('Invalid worker role');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return users;
  }
}
