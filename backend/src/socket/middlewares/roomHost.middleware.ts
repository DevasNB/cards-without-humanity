import { ExtendedError } from "socket.io";
import { GameSocket } from "../types/socket";
import { RoomService } from "../../services/room.service";

const roomService = new RoomService();

export const socketAuthenticationMiddleware = async (
  socket: GameSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    const isHost = await roomService.createRoom(socket.data.userId);
    console.log(socket.data);
    next();
  } catch (error: any) {
    console.error("Socket authentication error:", error);
    next(new Error(`Authentication error: ${error.message}`));
  }
};
