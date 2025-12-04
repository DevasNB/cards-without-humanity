import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RoomResponse, RoomUser } from '../../../services/room/room.types';
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
  private _room!: RoomResponse;
  @Input()
  set room(value: RoomResponse) {
    this._room = value;
    this.users.set(this._room?.users ?? []);
    this.allReady.set(this._room?.users.every((u) => u.status === 'READY'));
  }
  get room() {
    return this._room;
  }

  currentUser = signal<RoomUser | null>(null);

  // Local editable copy of the room fields
  protected editableRoom = signal<Partial<RoomResponse>>({});

  // Output to parent for critical actions (leave, room not found)
  @Output() roomNotFound = new EventEmitter<string>();

  // Local error message
  protected errorMessage = signal<string | null>(null);

  // Unsubscribing observables
  private readonly destroy$ = new Subject<void>();

  // Derived Signals
  protected readonly users = signal<RoomUser[]>([]);
  protected readonly allReady = signal<boolean>(false);

  constructor(protected readonly lobbyService: LobbyService) {}

  // Lifecycle Hooks
  ngOnInit() {
    // Listen for room updates
    this.lobbyService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => this.socketErrorHandler(error));

    // update whenever room changes
    this.lobbyService.currentUser$.subscribe((user) => this.currentUser.set(user));
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
   * Updates the room settings based on the given changes.
   * @param changes - The object containing the changes to the room's settings.
   */
  handleRoomChange(changes: Partial<RoomResponse>) {
    this.lobbyService.updateRoomSettings(changes);
  }
}
