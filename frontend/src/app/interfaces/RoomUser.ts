// The interface of a RoomUser
interface RoomUser {
  id: string;
  name: string;
  isHost: boolean;
  status: "DISCONNECTED" | "WAITING" | "READY" | "IN_GAME";
}