// src/services/auth.service.ts
import prisma from "../utils/prisma";
import { CreateUserRequestBody, UserResponse } from "../types/auth";
import { ConflictError, ValidationError } from "../utils/errors";
import { UserRole } from "@prisma/client";

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

    return newUser;
  }
}
