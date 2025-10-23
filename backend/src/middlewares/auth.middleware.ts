// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";
import { JwtPayload } from "../types/auth"; // Import JwtPayload
import { UserRole } from "@prisma/client";

// Extend Express's Request interface to include the `user` property
declare module "express" {
  interface Request {
    user?: JwtPayload; // Now req.user will be type-safe
  }
}

// Define a clean, strict return type
export type Cookies = Record<string, string> | { empty: true };

/**
 * Parses a raw 'Cookie' header string into an object.
 *
 * @param rawCookies - The raw cookie header string (e.g. "a=1; b=2")
 * @returns An object with cookie key-value pairs, or { empty: true } if no cookies exist.
 */
export const getCookies = (rawCookies?: string): Cookies => {
  if (!rawCookies) return { empty: true };

  const cookies: Record<string, string> = {};

  for (const cookie of rawCookies.split(";")) {
    const [key, ...rest] = cookie.trim().split("=");
    if (key) {
      cookies[key] = rest.join("="); // supports '=' inside cookie values
    }
  }

  return Object.keys(cookies).length > 0 ? cookies : { empty: true };
};

/**
 * Middleware to authenticate requests using a JWT from the Authorization header.
 * Attaches the decoded user payload to `req.user`.
 * @throws {UnauthorizedError} If no token is provided, token is invalid, or token is expired.
 */
export const authenticate =
  (role: UserRole = UserRole.ANONYMOUS) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.cookie, 1491)
    const cookies = getCookies(req.headers.cookie);

    if ("empty" in cookies || !cookies.accessToken) {
      throw new UnauthorizedError(
        "No token provided. Authentication required."
      );
    }

    try {
      const decoded = verifyToken(cookies.accessToken); // Verify and decode the token

      const userRole = decoded.role;

      // If the user's role doesn't match the expected role
      if (
        (userRole === UserRole.ANONYMOUS && role !== UserRole.ANONYMOUS) ||
        (userRole === UserRole.USER && role === UserRole.ADMIN)
      ) {
        throw new UnauthorizedError("Unauthorized access.");
      }

      console.log("HRHFFH");

      req.user = decoded; // Attach the decoded user payload to the request object
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      // verifyToken already throws UnauthorizedError with specific messages
      next(error); // Pass the error to the global error handler
    }
  };
