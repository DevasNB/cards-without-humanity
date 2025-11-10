import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../services/room/room.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(
    private readonly roomService: RoomService,
    private readonly router: Router,
  ) {}

  createRoom() {
    this.roomService.createRoom().subscribe({
      next: (room) => {
        this.router.navigate(['/room', room.id]);
      },

      error: (error) => {
        this.router.navigate(['/login']);
      },
    });
  }
}
