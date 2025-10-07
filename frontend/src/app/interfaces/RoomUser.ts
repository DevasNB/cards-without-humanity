// The interface of a RoomUser
interface RoomUser {
  name: string;
  isHost: boolean;
  status: "DISCONNECTED" | "WAITING" | "READY" | "IN_GAME";
}