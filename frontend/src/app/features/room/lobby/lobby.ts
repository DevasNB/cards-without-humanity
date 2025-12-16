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
import { RoomResponse, RoomUserResponse } from 'cah-shared';
import { LobbyService } from '../../../services/room/lobby/lobby.service';
import { LobbySettings } from './lobby-settings/lobby-settings';
import { PlayerList } from './player-list/player-list';
import { LobbyActions } from './lobby-actions/lobby-actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule, FormsModule, LobbySettings, PlayerList, LobbyActions],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css',
})
export class Lobby implements OnInit, OnDestroy {
  // Properties
  @Output() roomNotFound = new EventEmitter<string>(); // Output to parent for critical actions (leave, room not found)
  private readonly destroy$ = new Subject<void>();

  // Derived Signals
  protected readonly room = signal<RoomResponse | null>(null);
  protected readonly currentUser = signal<RoomUserResponse | null>(null);
  protected readonly allReady = computed(
    () => this.room()?.users.every((u) => u.status === 'READY') ?? false,
  );

  protected editableRoom = signal<Partial<RoomResponse>>({}); // Local editable copy of the room fields
  protected errorMessage = signal<string | null>(null); // Local error message

  constructor(
    protected readonly lobbyService: LobbyService,
    private readonly router: Router,
  ) {}

  // Lifecycle Hooks
  ngOnInit() {
    this.lobbyService.room$.pipe(takeUntil(this.destroy$)).subscribe((room) => {
      this.room.set(room);
    });

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

  protected redirectHome(): void {
    this.router.navigate(['/home']);
  }
}
