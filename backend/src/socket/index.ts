// src/socket/index.ts
import { Server as HttpServer } from "node:http"; // For the http server type
import { Server as SocketIOServer } from "socket.io";
import { GameSocket, SocketData } from "./types/socket";
import { ClientToServerEvents, ServerToClientEvents } from "./types/events";
import { socketAuthenticationMiddleware } from "./middlewares/authentication.middleware";
import { registerGameHandlers } from "./handlers/gameHandler";

// Declare a type alias for the full Socket.IO server instance
export type IoInstance = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

/**
 * Initializes the Socket.IO server and attaches it to the HTTP server.
 * @param httpServer The HTTP server instance (your Express app's server).
 * @returns The initialized Socket.IO server instance.
 */
export const initializeSocketIO = (httpServer: HttpServer): IoInstance => {
  const io: IoInstance = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // path: '/socket.io',
  });

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

    socket.on("disconnect", () => {
      console.log(
        `User disconnected: ${socket.data.username} (ID: ${socket.id})`
      );
    });
  });

  return io;
};
