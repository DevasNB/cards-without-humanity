// src/socket/types/socket.d.ts

import { Server as HttpServer } from "node:http"; // For the http server type
import { Socket, Server as SocketIOServer } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "cah-shared";

// Custom properties that we might attach to the socket object
export interface SocketData {
  userId: string;
  username: string;
  currentRoomId?: string; // The ID of the room the user is currently in
  currentGameId?: string; // The ID of the game the user is currently in
  isHost?: boolean;
}

type ClientToServerHandlers = {
  [K in keyof ClientToServerEvents]: (payload: ClientToServerEvents[K]) => void;
};

type ServerToClientHandlers = {
  [K in keyof ServerToClientEvents]: (payload: ServerToClientEvents[K]) => void;
};

// Declare a type alias for the full Socket.IO server instance
export type IoInstance = SocketIOServer<
  ClientToServerHandlers,
  ServerToClientHandlers,
  {},
  SocketData
>;

export function createIOInstance(server: HttpServer): IoInstance {
  return new SocketIOServer<
    ClientToServerHandlers,
    ServerToClientHandlers,
    {},
    SocketData
  >(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // path: '/socket.io',
  });
}

// Custom socket type that includes our specific client and server event types
// and custom data. This is used when initializing the Socket.IO server.
export type GameSocket = Socket<
  ClientToServerHandlers,
  ServerToClientHandlers,
  {},
  SocketData
>;
