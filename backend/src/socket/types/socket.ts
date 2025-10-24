// src/socket/types/socket.d.ts

import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./events";

// Custom properties that we might attach to the socket object
export interface SocketData {
  userId: string;
  username: string;
  currentRoomId: string; // The ID of the room the user is currently in
}

// Custom socket type that includes our specific client and server event types
// and custom data. This is used when initializing the Socket.IO server.
export type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
