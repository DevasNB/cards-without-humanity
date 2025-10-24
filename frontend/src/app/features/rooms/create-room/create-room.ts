import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SocketService } from '../../../services/socket.service';

@Component({
  standalone: true,
  selector: 'create-room',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-room.html',
  styleUrl: './create-room.css',
})
export class CreateRoomComponent {
  // Properties

  // Placeholder data
  roomId = '12345'; // normalmente vem da rota
  roomName = 'Minha Sala';
  isPublic = true;
  winningRounds = 5;
  maxPlayers = 8;

  players: RoomUser[] = [];

  constructor(private readonly socketService: SocketService) {}

  // Getters

  // Counts the total number of players that are ready
  get readyCount(): number {
    return this.players.filter((p) => p.status === 'READY').length;
  }

  // Methods

  // Toggles the privacy of the room
  togglePrivacy() {
    this.isPublic = !this.isPublic;
  }

  // Toggles the status of a player
  toggleStatus(player: RoomUser) {
    const newStatus = player.status === 'READY' ? 'WAITING' : 'READY';
    player.status = newStatus;
  }

  // Starts the game
  startGame() {
    if (this.readyCount < this.players.length) {
      alert('Nem todos os jogadores estão prontos!');
      return;
    }

    alert('O jogo vai começar!');
  }

  // Copies the link of the room
  copyInviteLink() {
    navigator.clipboard.writeText(globalThis.location.href);
    alert('Link da sala copiado!');
  }
}
