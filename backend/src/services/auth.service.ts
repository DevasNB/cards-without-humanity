// src/services/auth.service.ts
import prisma from "../utils/prisma";
import {
  CreateUserRequestBody,
  EnterAnoynmousRequestBody,
  UserResponse,
} from "../types/auth";
import { UserRole } from "@prisma/client";
import { ConflictError, NotFoundError } from "../utils/errors";

export class AuthService {
  /**
   * Creates a new user in the database.
   * @param userData - An object containing the new user's username.
   * @returns A promise that resolves to the created user's data.
   * @throws {ConflictError} If a user with the given username already exists.
   */
  public async createUser(
    userData: CreateUserRequestBody
  ): Promise<UserResponse> {
    const { username } = userData;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictError(
        `User with username '${username}' already exists.`
      );
    }

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        role: UserRole.USER,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }

  /**
   * Authenticates a user with username.
   * Assumes loginData has been validated by middleware.
   * @param loginData - User login credentials.
   * @returns User data and a new JWT.
   */
  public async enterAnonymously(
    loginData: EnterAnoynmousRequestBody
  ): Promise<UserResponse> {
    const { username } = loginData;

    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (user && user?.role !== UserRole.ANONYMOUS) {
      throw new ConflictError(
        `User with username '${username}' already exists.`
      );
    } else {
      user ??= await prisma.user.create({
        data: {
          username: username.trim(), // TODO: trimming shouldn't be there. should be in verification phase
          role: UserRole.ANONYMOUS, // Explicitly set the default role
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Return user data and token
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }

  public async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Return user data and token
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }
}
