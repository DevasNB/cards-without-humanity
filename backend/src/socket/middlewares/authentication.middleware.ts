const jwt = require("jsonwebtoken");
import { UserRole } from "@prisma/client";
import { extractUserFromJWT, generateToken } from "../../utils/jwt";
import { GameSocket } from "../types/socket";
import { ExtendedError } from "socket.io";

console.log(
  generateToken({
    id: "1414",
    username: "phi19",
    role: UserRole.ANONYMOUS,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
);

// --- Socket.IO Middleware for Authentication & Initial Setup ---
export const socketAuthenticationMiddleware = async (
  socket: GameSocket,
  next: (err?: ExtendedError) => void
) => {
  const cookieString = socket.request.headers.cookie || "";

  console.log(cookieString, 14913)
  try {
    const decoded = extractUserFromJWT(cookieString, UserRole.ANONYMOUS);

    socket.data.userId = decoded.userId;
    socket.data.username = decoded.username;
    next();
  } catch (error: any) {
    console.error("Socket authentication error:", error);
    next(new Error(`Authentication error: ${error.message}`));
  }
};
