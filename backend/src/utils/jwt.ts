// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth"; // Your JWT payload type
import { UserResponse } from "cah-shared"; // Your JWT payload type
import { UnauthorizedError } from "./errors"; // Custom error for auth issues
import { JWT_SECRET, JWT_EXPIRES_IN } from "../configs/constants";
import { getCookies } from "./cookies";
import { UserRole } from "@prisma/client";

export const jwtCookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};

// Generate JWT for the user
export const generateToken = (user: UserResponse): string => {
  const payload = getJwtPayload(user);

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    // The 'as JwtPayload' assertion tells TypeScript what type the decoded payload should be
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // e.g., 'invalid token', 'jwt malformed'
      throw new UnauthorizedError("Invalid token.");
    }
    if (error instanceof jwt.TokenExpiredError) {
      // e.g., 'jwt expired'
      throw new UnauthorizedError("Token expired.");
    }
    // General unexpected error
    throw new UnauthorizedError("Authentication failed.");
  }
};

export const extractUserFromJWT = (
  cookieString: string,
  role: UserRole
): JwtPayload => {
  const cookies = getCookies(cookieString);

  if ("empty" in cookies || !cookies.accessToken) {
    throw new UnauthorizedError("No token provided. Authentication required.");
  }

  const decoded = verifyToken(cookies.accessToken); // Verify and decode the token

  const userRole = decoded.role;

  // If the user's role doesn't match the expected role
  if (
    (userRole === UserRole.ANONYMOUS && role !== UserRole.ANONYMOUS) ||
    (userRole === UserRole.USER && role === UserRole.ADMIN)
  ) {
    throw new UnauthorizedError("Unauthorized access.");
  }

  return decoded;
};

const getJwtPayload = (newUser: UserResponse): JwtPayload => ({
  userId: newUser.id,
  username: newUser.username,
  role: newUser.role,
});
