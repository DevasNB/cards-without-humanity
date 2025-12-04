import { Injectable } from '@angular/core';
import { SocketService } from '../../socket.service';
import { BehaviorSubject } from 'rxjs';
import { RoomResponse, RoomUser, SocketError, StartingGamePayload } from '../room.types';

@Injectable({ providedIn: 'root' })
export class LobbyService {
  private readonly roomSubject = new BehaviorSubject<RoomResponse | null>(null);
  room$ = this.roomSubject.asObservable();

  private readonly gameStartSubject = new BehaviorSubject<any>(null);
  gameStart$ = this.gameStartSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<SocketError | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private readonly socketService: SocketService) {
    this.socketService
      .listen<RoomResponse>('room:update')
      .subscribe((room) => this.roomSubject.next(room));

    this.socketService
      .listen<StartingGamePayload>('room:initGame')
      .subscribe((game) => this.gameStartSubject.next(game));

    this.socketService
      .listen<SocketError>('error')
      .subscribe((error) => this.errorSubject.next(error));
  }

  // Actions

  /**
   * Joins a room.
   * This method will send a 'room:join' event to the server.
   * After joining the room, the client will receive updates about the room's state.
   * @param roomId - The ID of the room to join.
   * @returns {void}
   */
  joinRoom(roomId: string): void {
    this.socketService.emit('room:join', { roomId: roomId });
  }

  /**
   * Leaves the current room.
   * This method will send a 'room:leave' event to the server.
   * After leaving the room, the user will be redirected to the lobby.
   * @returns {void}
   */
  leaveRoom(): void {
    this.socketService.emit('room:leave');
  }

  /**
   * Toggle current user's ready status
   */
  toggleCurrentUserStatus(user: RoomUser): void {
    const room = this.roomSubject.getValue();
    if (!room || !user) return;

    const newStatus = user.status === 'READY' ? 'WAITING' : 'READY';

    // Update local signal
    const updatedRoom: RoomResponse = {
      ...room,
      users: room.users.map((u) => {
        if (u.id !== user.id) {
          return u;
        }
        return { ...u, status: newStatus };
      }),
    };

    this.roomSubject.next(updatedRoom);

    // Emit to server
    this.socketService.emit('room:user:update', { status: newStatus });
  }

  updateRoomSettings(changes: Partial<RoomResponse>) {
    const room = this.roomSubject.getValue();
    if (!room) return;

    const updatedRoom = { ...room, ...changes };
    this.roomSubject.next(updatedRoom); // update local signal immediately

    // send to backend
    this.socketService.emit('room:host:updateSettings', updatedRoom);
  }

  /**
   * Start the game (host only)
   */
  startGame(): void {
    const room = this.roomSubject.getValue();
    if (!room) return;

    // Optional validations (all ready + minimum players)
    const allReady = room.users.every((u) => u.status === 'READY');
    if (!allReady) {
      this.errorSubject.next({
        type: 'not-ready',
        message: 'Nem todos os jogadores estão prontos!',
      });
      return;
    }

    if (room.users.length < 3) {
      this.errorSubject.next({
        type: 'min-players',
        message: 'O jogo precisa de pelo menos 3 jogadores!',
      });
      return;
    }

    // Emit start game
    this.socketService.emit('room:host:startGame');
  }
}
