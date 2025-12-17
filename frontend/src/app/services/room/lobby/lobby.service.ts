import { Injectable, OnDestroy } from '@angular/core';
import { SocketService } from '../../socket.service';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { RoomResponse, RoomUserResponse, SocketError } from 'cah-shared';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class LobbyService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private currentRoomId?: string;

  private readonly roomSubject = new BehaviorSubject<RoomResponse | null>(null);
  room$ = this.roomSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<SocketError | null>(null);
  error$ = this.errorSubject.asObservable();

  currentUser$: Observable<RoomUserResponse | null> = this.room$.pipe(
    map((room) => {
      const auth = this.authService.currentUser();
      if (!room || !auth) return null;
      return room.users.find((u) => u.username === auth.username) || null;
    }),
  );
  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
  ) {
    this.socketService
      .listen('room:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe((room) => this.roomSubject.next(room));
      
    this.socketService
      .listen('error')
      .pipe(takeUntil(this.destroy$))
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
    if (this.currentRoomId === roomId) return;

    if (this.currentRoomId) {
      this.socketService.emit('room:leave');
    }

    this.currentRoomId = roomId;
    this.socketService.emit('room:join', { roomId: roomId });
  }

  /**
   * Leaves the current room.
   * This method will send a 'room:leave' event to the server.
   * After leaving the room, the user will be redirected to the lobby.
   * @returns {void}
   */
  leaveRoom(): void {
    if (!this.currentRoomId) return;

    this.socketService.emit('room:leave');

    this.currentRoomId = undefined;
    this.roomSubject.next(null);
  }

  /**
   * Toggle current user's ready status
   */
  toggleCurrentUserStatus(): void {
    const room = this.roomSubject.getValue();
    const auth = this.authService.currentUser();
    if (!room || !auth) return;

    const user = room.users.find((u) => u.username === auth.username);
    if (!user) return;

    const newStatus = user.status === 'READY' ? 'WAITING' : 'READY';

    // Update local state immediately
    const updatedRoom: RoomResponse = {
      ...room,
      users: room.users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
    };
    this.roomSubject.next(updatedRoom);

    // Send update to server
    this.socketService.emit('room:user:update', { ...user, status: newStatus });
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

    if (false) {
      const allReady = room?.users.every((u) => u.status === 'READY');
      if (!allReady) {
        this.errorSubject.next({
          type: 'not-ready',
          message: 'Nem todos os jogadores estão prontos!',
        });
        return;
      }

      if ((room?.users?.length || 0) < 3) {
        this.errorSubject.next({
          type: 'min-players',
          message: 'O jogo precisa de pelo menos 3 jogadores!',
        });
        return;
      }
    }

    // Emit start game
    this.socketService.emit('room:host:startGame');
  }

  ngOnDestroy() {
    this.leaveRoom();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
