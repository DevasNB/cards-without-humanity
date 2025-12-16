import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from '../../services/room/lobby/lobby.service';
import { Subject, takeUntil } from 'rxjs';
import { LoadingSkeleton } from '../../loading-skeleton/loading-skeleton';
import { Lobby } from './lobby/lobby';
import { Game } from './game/game';
import { GameService } from '../../services/room/game/game.service';
import { SocketService } from '../../services/socket.service';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule, Lobby, Game, LoadingSkeleton],
  providers: [LobbyService, SocketService, GameService],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomComponent implements OnInit, OnDestroy {
  // Properties
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    protected readonly lobbyService: LobbyService,
    protected readonly gameService: GameService,
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const roomId = params.get('roomId');

      if (!roomId) {
        // TODO: Handle error
        this.redirectHome();
        return;
      }

      // Join room
      this.lobbyService.joinRoom(roomId);
    });
  }

  /**
   * When leaving the component, clean up subscriptions and leave the room.
   */
  ngOnDestroy() {
    this.destroy();
  }

  /**
   * Cleans up subscriptions and leaves the room.
   */
  private destroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Leave room
    this.lobbyService.leaveRoom();
  }

  protected redirectHome(): void {
    this.router.navigate(['/home']);
  }
}
