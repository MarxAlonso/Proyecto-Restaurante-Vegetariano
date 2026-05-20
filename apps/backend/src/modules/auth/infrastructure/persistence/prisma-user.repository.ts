import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from '../../domain/user.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';

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
    const data: any = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    if (user.password) {
      data.password = user.password;
    }
    const createdUser = await prisma.user.create({ data });
    return createdUser as UserEntity;
  }
}
