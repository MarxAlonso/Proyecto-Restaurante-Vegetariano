import { UserRepository } from '../../domain/user.repository';
import { UserEntity } from '../../domain/user.entity';
import prisma from '../../../../infrastructure/persistence/prisma.client';
import { Prisma } from '@prisma/client';

/**
 * Convierte un usuario de Prisma a UserEntity manteniendo type safety.
 * Previene el uso de `as any` que oculta errores de tipo en runtime.
 */
function toUserEntity(user: Prisma.UserGetPayload<{}>): UserEntity {
  return {
    id: user.id,
    email: user.email,
    password: user.password ?? undefined,
    name: user.name,
    role: user.role as UserEntity['role'],
    createdAt: user.createdAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user ? toUserEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? toUserEntity(user) : null;
  }

  async save(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity> {
    const data: Prisma.UserCreateInput = {
      email: user.email,
      name: user.name,
      role: user.role as any,
    };
    if (user.password) {
      data.password = user.password;
    }
    const createdUser = await prisma.user.create({ data });
    return toUserEntity(createdUser);
  }
}
