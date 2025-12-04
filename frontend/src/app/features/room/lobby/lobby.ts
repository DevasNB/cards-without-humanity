import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RoomResponse } from '../../../services/room/room.types';
import { AuthService } from '../../../services/auth/auth.service';
import { LobbyService } from '../../../services/room/lobby/lobby.service';
import { LobbySettings } from './lobby-settings/lobby-settings';
import { PlayerList } from './player-list/player-list';
import { LobbyActions } from './lobby-actions/lobby-actions';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule, FormsModule, LobbySettings, PlayerList, LobbyActions],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css',
})
export class Lobby implements OnInit, OnDestroy {
  // Properties
  // Room from parent
  @Input() room!: RoomResponse;
  @Output() roomChange = new EventEmitter<Partial<RoomResponse>>();

  // Local editable copy of the room fields
  protected editableRoom = signal<Partial<RoomResponse>>({});

  // Output to parent for critical actions (leave, room not found)
  @Output() roomNotFound = new EventEmitter<string>();

  // Local error message
  protected errorMessage = signal<string | null>(null);

  // Unsubscribing observables
  private readonly destroy$ = new Subject<void>();

  // Derived Signals

  protected readonly users = computed(() => this.room?.users ?? []);

  protected readonly user = computed(
    () => this.users().find((u) => u.username === this.authService.currentUser()?.username) || null,
  );

  protected readonly isHost = computed(() => this.user()?.isHost ?? false);

  protected readonly readyCount = computed(
    () => this.users().filter((u) => u.status === 'READY').length,
  );

  protected readonly allReady = computed(() => this.users().every((u) => u.status === 'READY'));

  constructor(
    private readonly authService: AuthService,
    private readonly lobbyService: LobbyService,
  ) {}

  // Lifecycle Hooks
  ngOnInit() {
    // Listen for room updates
    this.lobbyService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => this.socketErrorHandler(error));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Methods

  /**
   * Handles socket errors, updating the error message and redirecting to the home page if the error is of type 'not-found'.
   * @param error - The error object from the socket.
   */
  private socketErrorHandler(error: any): void {
    if (!error) return;

    if (error.type === 'not-found') {
      // Emit to parent so it can redirect
      // this.roomNotFound.emit(error.message);
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
    if (!this.isHost()) return;

    this.lobbyService.updateRoomName(name.trim());
  }

  /**
   * Toggles the privacy of the room if the current user is the host.
   * This method updates the room settings and sends an event to the server.
   * If the current user is not the host, the method does nothing.
   * @returns {void}
   */
  protected togglePrivacy(): void {
    if (!this.isHost()) return;

    this.lobbyService.togglePrivacy();
  }

  /**
   * Toggles the status of the current user in the room.
   * If the current user is not in the room, this method does nothing.
   * @returns {void}
   */
  protected toggleStatus(): void {
    const user = this.user();
    if (!user) return;

    this.lobbyService.toggleCurrentUserStatus(user);
  }

  /**
   * Starts the game if all players are ready.
   * If not all players are ready, shows an alert with a message.
   * @returns {void}
   */
  protected startGame(): void {
    if (!this.isHost()) return;

    // LobbyService handles validation & emits socket event
    this.lobbyService.startGame();
  }

  
}
