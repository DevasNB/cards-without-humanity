import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  roomName = 'Minha Sala';
  isPublic = true;
  winningRounds = 5;
  maxPlayers = 8;

  players: RoomUser[] = [
    { name: 'João', isHost: true, status: 'WAITING' },
    { name: 'Maria', isHost: false, status: 'READY' },
    { name: 'Rita', isHost: false, status: 'WAITING' },
  ];

  // Getters

  // Counts the total number of players that are ready
  get readyCount(): number {
    return this.players.filter(p => p.status === 'READY').length;
  }

  // Methods

  // Toggles the privacy of the room
  togglePrivacy() {
    this.isPublic = !this.isPublic;
  }

  // Toggles the status of a player
  toggleStatus(player: RoomUser) {
    player.status = player.status === 'READY' ? 'WAITING' : 'READY';
  }

  // Starts the game
  startGame() {
    if (this.readyCount < this.players.length) {
      alert('Nem todos os jogadores estão prontos!');
      return;
    }
    alert('O jogo vai começar!');
    // Aqui poderias redirecionar para o componente do jogo
  }

  // Copies the link of the room
  copyInviteLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link da sala copiado!');
  }
}
