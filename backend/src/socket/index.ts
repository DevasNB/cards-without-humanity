// src/socket/index.ts
import { Server as HttpServer } from "node:http"; // For the http server type
import { createIOInstance, GameSocket, IoInstance } from "./config";
import { socketAuthenticationMiddleware } from "./middlewares/authentication.middleware";
import { registerGameHandlers } from "./handlers/gameHandler";

/**
 * Initializes the Socket.IO server and attaches it to the HTTP server.
 * @param httpServer The HTTP server instance (your Express app's server).
 * @returns The initialized Socket.IO server instance.
 */
export const initializeSocketIO = (httpServer: HttpServer): IoInstance => {
  const io: IoInstance = createIOInstance(httpServer);

  // --- Authentication Middleware & Initial Setup ---
  io.use(socketAuthenticationMiddleware);

  // --- Connection Event ---
  io.on("connection", (socket: GameSocket) => {
    console.log(`A user connected: ${socket.data.username} (ID: ${socket.id})`);

    // Register all specific game event handlers for this connected socket
    registerGameHandlers(io, socket);

    // Initial welcome message or state
    socket.emit("info", {
      message: `Welcome, ${socket.data.username}! You are connected.`,
    });
  });

  return io;
};
