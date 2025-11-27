import { Component, OnDestroy, OnInit, Output, signal, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { GameResponse, RoomResponse, RoomUser, SocketError } from '../../services/room/room.types';
import { LoadingSkeleton } from '../../loading-skeleton/loading-skeleton';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule, FormsModule, RouterLink, LoadingSkeleton],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css',
})
export class Lobby implements OnInit, OnDestroy {
  // Properties

  roomId: string | null = null;
  protected room = signal<RoomResponse | null>(null);
  protected errorMessage = signal<string | null>(null);

  private readonly subscriptions: Subscription[] = [];

  @Output() notifyGameStarted: EventEmitter<any> = new EventEmitter();

  constructor(
    private readonly socketService: SocketService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    // Set roomId from URL
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  ngOnInit() {
    // Join room
    this.socketService.emit('room:join', { roomId: this.roomId });

    // Listen for room updates
    this.subscriptions.push(
      this.socketService.listen<RoomResponse>('room:update').subscribe((room) => {
        this.room.set(room);
      }),

      this.socketService.listen<SocketError>('error').subscribe((error) => {
        this.socketErrorHandler(error);
      }),

      this.socketService.listen<GameResponse>('game:update').subscribe((game) => {
        console.log(game, 14941);
        this.notifyGameStarted.emit(true);
      }),
    );
  }

  ngOnDestroy() {
    // Unsubscribe to all events
    for (const s of this.subscriptions) s.unsubscribe();

    // Leave room
    this.socketService.emit('room:leave', { roomId: this.roomId });
  }

  // Getters

  /**
   * Returns the current user in the room, or null if no room exists.
   * @returns The current user in the room, or null if no room exists.
   */
  protected get user(): RoomUser | null {
    const room = this.room();
    if (!room) return null;

    return room.users.find((p) => p.username === this.authService.currentUser()?.username) || null;
  }

  /**
   * Returns the list of players in the room, or an empty array if no room exists.
   * @returns The list of players in the room, or an empty array if no room exists.
   */
  protected get players(): RoomUser[] {
    const room = this.room();
    return room ? room.users : [];
  }

  /**
   * Returns the count of players in the room that are ready to start the game.
   * @returns The count of players in the room that are ready to start the game.
   */
  protected get readyCount(): number {
    return this.players.filter((p) => p.status === 'READY').length;
  }

  // Methods

  /**
   * Handles socket errors, updating the error message and redirecting to the home page if the error is of type 'not-found'.
   * @param error - The error object from the socket.
   */
  private socketErrorHandler(error: any) {
    if (error.type === 'not-found') {
      this.errorMessage.set(error.message + '. Redirecting...');

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 3000);
    } else {
      this.errorMessage.set(error.message);
    }

    console.log('Room error:', error.type, '\n', error.message);
  }

  /**
   * Changes the name of the room if the current user is the host.
   * @param name - The new name of the room.
   */
  protected changeName(name: string) {
    const room = this.room();
    const myRoomUser = this.user;
    if (!room || !myRoomUser?.isHost) return;

    this.room.update((current) => {
      if (!current) return current; // handle null safely
      return { ...current, name };
    });

    this.updateSettings();
  }

  /**
   * Toggles the privacy of the room if the current user is the host.
   * This method updates the room settings and sends an event to the server.
   * If the current user is not the host, the method does nothing.
   * @returns {void}
   */
  protected togglePrivacy(): void {
    const room = this.room();
    const myRoomUser = this.user;
    if (!room || !myRoomUser?.isHost) return;

    this.room.update((current) => {
      if (!current) return current; // handle null safely
      return { ...current, isPublic: !current.isPublic };
    });

    this.updateSettings();
  }

  /**
   * Updates the room settings by sending an event to the server.
   * This method should only be called by the host of the room.
   * @returns {void}
   */
  private updateSettings(): void {
    const room = this.room();
    const myRoomUser = this.user;
    if (!room || !myRoomUser?.isHost) return;

    this.socketService.emit('room:updateSettings', room);
  }

  /**
   * Updates the room user by sending an event to the server.
   * This method should only be called by the current user in the room.
   * @returns {void}
   */
  private updateUser(): void {
    const user = this.user;
    if (!user) return;

    this.socketService.emit('roomUser:update', user);
  }

  /**
   * Toggles the status of the current user in the room.
   * If the current user is not in the room, this method does nothing.
   * @returns {void}
   */
  protected toggleStatus(): void {
    const player = this.user;
    if (!player) return;

    const newStatus = player.status === 'READY' ? 'WAITING' : 'READY';

    this.room.update((current) => {
      if (!current) return current; // handle null safely

      return {
        ...current,
        users: [...current.users].map((p) => {
          if (p.id !== player.id) return p;
          return {
            ...p,
            status: newStatus,
          };
        }),
      };
    });

    this.updateUser();
  }

  /**
   * Starts the game if all players are ready.
   * If not all players are ready, shows an alert with a message.
   * @returns {void}
   */
  protected startGame(): void {
    this.notifyGameStarted.emit(true);
    return;

    if (this.readyCount < this.players.length) {
      alert('Nem todos os jogadores estão prontos!');
      return;
    }

    if (this.readyCount < 3) {
      alert('O jogo precisa de pelo menos 3 jogadores para iniciar.');
      return;
    }

    alert('O jogo vai começar!');

    this.socketService.emit('room:startGame');
  }

  /**
   * Copies the current room's invite link to the user's clipboard.
   * Shows an alert with a success message after copying the link.
   * @returns {void}
   */
  protected copyInviteLink(): void {
    navigator.clipboard.writeText(globalThis.location.href);
    alert('Link da sala copiado!');
  }
}
