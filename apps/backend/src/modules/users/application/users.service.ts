import bcrypt from 'bcryptjs';
import prisma from '../../../infrastructure/persistence/prisma.client';

export class UsersService {
  async createWorker(data: any) {
    const { email, password, name, role, salary } = data;

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
        salary: salary ? parseFloat(salary) : null,
      },
    });

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async getAllUsers(role?: string) {
    const where: any = {};
    if (role) {
      where.role = role.toUpperCase();
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        salary: true,
        createdAt: true,
      },
    });
    return users;
  }

  async updateUser(id: string, data: any) {
    const { password, ...updateData } = data;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (updateData.salary) {
      updateData.salary = parseFloat(updateData.salary);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
