import { UserEntity } from './user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: Omit<UserEntity, 'id' | 'createdAt'>): Promise<UserEntity>;
}
