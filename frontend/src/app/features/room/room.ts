import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from '../../services/room/lobby/lobby.service';
import { Subject, takeUntil } from 'rxjs';
import { LoadingSkeleton } from '../../loading-skeleton/loading-skeleton';
import { Lobby } from './lobby/lobby';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule, Lobby, LoadingSkeleton],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomComponent implements OnInit, OnDestroy {
  // Properties
  roomId: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    protected readonly lobbyService: LobbyService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    // Set roomId from URL
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    if (!this.roomId) {
      // TODO: Handle error
      this.redirectHome();
      return;
    }

    // Join room
    this.lobbyService.joinRoom(this.roomId);

    // Subscribe to room updates (from service-managed stream)
    this.lobbyService.room$.pipe(takeUntil(this.destroy$)).subscribe((room) => {
    });
  }

  /**
   * Cleans up subscriptions and leaves the room.
   */
  ngOnDestroy() {
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
