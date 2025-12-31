import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room/room.service';
import { Router } from '@angular/router';
import { ListedRoom } from 'cah-shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms-list.html',
  styleUrl: './rooms-list.css',
})
export class RoomsListComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();
  protected rooms = signal<ListedRoom[]>([]);
  protected loading = signal<boolean>(true);

  constructor(
    private readonly roomsService: RoomService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.roomsService
      .getRooms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.rooms.set(rooms);
          this.loading.set(false);
        },
        error: () => {
          this.rooms.set([]);
          this.loading.set(false);
        },
      });
  }

  goToRoom(roomId: string) {
    this.router.navigate(['/room', roomId]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
