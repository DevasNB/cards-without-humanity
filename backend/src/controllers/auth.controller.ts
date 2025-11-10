// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { CreateUserRequestBody, UserResponse } from "../types/auth";
import { generateToken, jwtCookieConfig } from "../utils/jwt";

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

    const token = generateToken(newUser);

    res.cookie("accessToken", token, jwtCookieConfig);

    res.status(201).json(newUser);
  }

  /**
   * Handles an HTTP POST request to login anonymously.
   * Assumes request body has been validated by middleware.
   * @param req - Express request object.
   * @param res - Express response object.
   * @returns A promise that resolves to the created anonymous user's data.
   */
  public async loginAnonymous(
    req: Request<{}, {}, CreateUserRequestBody>,
    res: Response<UserResponse | { error: string }>
  ) {
    const userData: CreateUserRequestBody = req.body;

    const anonymousUser = await authService.enterAnonymously(userData);

    const token = generateToken(anonymousUser);

    res.cookie("accessToken", token, jwtCookieConfig);

    res.status(200).json(anonymousUser);
  }

  /**
   * Handles the HTTP GET request to get the currently authenticated user's data.
   * Assumes req.user is populated by the authentication middleware.
   */
  public async getCurrentUser(
    req: Request,
    res: Response<UserResponse | { error: string }>,
    next: NextFunction
  ) {
    // req.user is guaranteed to exist here because the 'authenticate' middleware ran before this.
    if (!req.user) {
      // This case should theoretically not be hit if 'authenticate' middleware is used correctly
      return next(new Error("User not found on request after authentication."));
    }

    const userPayload = await authService.getCurrentUser(req.user.userId);

    res.status(200).json(userPayload);
  }

  /**
   * Clears the access token cookie and sends a 200 OK response.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  public async logout(req: Request, res: Response) {
    res.clearCookie("accessToken", jwtCookieConfig);
    res.status(204).send();
  }
}
