import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(data: any) {
    const { email, password, name } = data; // Ignore role passed from frontend

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      role: 'CLIENT', // Force CLIENT role for public registration
    });

    const token = this.generateToken(newUser);
    return { user: this.sanitizeUser(newUser), token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async googleLogin(credential: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new Error('Invalid Google credentials');
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = await this.userRepository.save({
        email,
        name,
        role: 'CLIENT', // Google users are automatically CLIENTs
      });
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  private generateToken(user: UserEntity) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }

  private sanitizeUser(user: UserEntity) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
