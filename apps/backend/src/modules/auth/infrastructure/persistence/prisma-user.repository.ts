import { UserRepository } from '../../domain/user.repository.js';
import { UserEntity } from '../../domain/user.entity.js';
import prisma from '../../../../infrastructure/persistence/prisma.client.js';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as UserEntity | null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as UserEntity | null;
  }

  async save(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity> {
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: user.password!,
        name: user.name,
        role: user.role,
      },
    });
    return createdUser as UserEntity;
  }
}
