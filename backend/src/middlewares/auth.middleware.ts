// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { extractUserFromJWT } from "../utils/jwt";
import { JwtPayload } from "../types/auth"; // Import JwtPayload
import { UserRole } from "@prisma/client";

// Extend Express's Request interface to include the `user` property
declare module "express" {
  interface Request {
    user?: JwtPayload; // Now req.user will be type-safe
  }
}

/**
 * Middleware to authenticate requests using a JWT from the Authorization header.
 * Attaches the decoded user payload to `req.user`.
 * @throws {UnauthorizedError} If no token is provided, token is invalid, or token is expired.
 */
export const authenticate =
  (role: UserRole = UserRole.ANONYMOUS) =>
  (req: Request, res: Response, next: NextFunction) => {
    const cookieString = req.headers.cookie || "";

    try {
      const decoded = extractUserFromJWT(cookieString, role);

      req.user = decoded; // Attach the decoded user payload to the request object
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      // verifyToken already throws UnauthorizedError with specific messages
      next(error); // Pass the error to the global error handler
    }
  };
