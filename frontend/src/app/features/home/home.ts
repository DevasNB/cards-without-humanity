import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../services/room/room.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private readonly roomService: RoomService) {}

  createRoom() {
    this.roomService.createRoom().subscribe();
  }
}
