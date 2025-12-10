import { UserRole } from "@prisma/client";
import { extractUserFromJWT } from "../../utils/jwt";
import { GameSocket } from "../types/config";
import { ExtendedError } from "socket.io";

// --- Socket.IO Middleware for Authentication & Initial Setup ---
export const socketAuthenticationMiddleware = async (
  socket: GameSocket,
  next: (err?: ExtendedError) => void
) => {
  const cookieString = socket.request.headers.cookie || "";

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
