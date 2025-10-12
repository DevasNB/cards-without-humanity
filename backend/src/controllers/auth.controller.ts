// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { CreateUserRequestBody, UserResponse } from "../types/auth";

// Instantiate the service (can be done with dependency injection in larger apps)
const authService = new AuthService();

export class AuthController {
  /**
   * Handles an HTTP POST request to create a new user
   * Assumes request body has been validated by middleware.
   */
  public async createUser(
    req: Request<{}, {}, CreateUserRequestBody>,
    res: Response<UserResponse | { error: string }>
  ) {
    const userData: CreateUserRequestBody = req.body;

    const newUser = await authService.createUser(userData);

    res.status(201).json(newUser);
  }
}
