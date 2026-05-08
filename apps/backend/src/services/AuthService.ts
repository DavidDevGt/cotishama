import { userRepository } from "../repositories/UserRepository";
import { hashPassword, validatePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AuthenticationError } from "../types/errors";
import type { User } from "../db/schema";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const user = await userRepository.getByEmail(credentials.email);

    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    if (user.isActive !== 1) {
      throw new AuthenticationError("User account is inactive");
    }

    const isPasswordValid = await validatePassword(credentials.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Update last login time
    await userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<string> {
    const payload = verifyRefreshToken(token);

    if (!payload) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }

    const user = await userRepository.getById(payload.id);

    if (!user || user.isActive !== 1) {
      throw new AuthenticationError("User not found or inactive");
    }

    return generateAccessToken(user);
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<User> {
    const existingUser = await userRepository.getByEmail(email);

    if (existingUser) {
      throw new AuthenticationError("Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await userRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: "VIEWER",
      isActive: 1,
    });

    return newUser;
  }
}

export const authService = new AuthService();
