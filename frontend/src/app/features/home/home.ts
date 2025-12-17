import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../services/room/room.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly roomService: RoomService,
    private readonly router: Router,
  ) {}

  createRoom() {
    this.roomService
      .createRoom()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (room) => {
          this.router.navigate(['/room', room.id]);
        },

        error: (error) => {
          this.router.navigate(['/login']);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
