import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'create-room',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-room.html',
  styleUrl: './create-room.css',
})
export class CreateRoomComponent implements OnInit, OnDestroy {
  // Properties

  // Placeholder data
  roomId = '12345';
  roomName = 'Minha Sala';
  isPublic = true;
  winningRounds = 5;
  maxPlayers = 8;

  players: RoomUser[] = [];

  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly socketService: SocketService) {}

  ngOnInit() {
    // Entrar na sala
    this.socketService.emit('room:joinRoom', { roomId: this.roomId, name: 'Jogador' });

    // Ouvir eventos do servidor
    this.subscriptions.push(
      this.socketService.listen<RoomUser[]>('room:playersUpdate').subscribe((players) => {
        this.players = players;
      }),

      this.socketService.listen<any>('room:settingsUpdate').subscribe((settings) => {
        Object.assign(this, settings);
      }),

      this.socketService.listen<string>('room:hostUpdate').subscribe((hostId) => {
        for (const player of this.players) {
          player.isHost = player.id === hostId;
        }
      }),
    );
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) s.unsubscribe();

    this.socketService.emit('room:leaveRoom', { roomId: this.roomId });
  }

  // Getters

  // Counts the total number of players that are ready
  get readyCount(): number {
    return this.players.filter((p) => p.status === 'READY').length;
  }

  // Methods

  // Toggles the privacy of the room
  togglePrivacy() {
    this.isPublic = !this.isPublic;

    this.socketService.emit('room:updateSettings', {
      roomId: this.roomId,
      isPublic: this.isPublic,
    });
  }

  // Toggles the status of a player
  toggleStatus(player: RoomUser) {
    const newStatus = player.status === 'READY' ? 'WAITING' : 'READY';
    player.status = newStatus;

    this.socketService.emit('room:updateStatus', {
      playerId: player.id,
      status: newStatus,
    });
  }

  // Starts the game
  startGame() {
    if (this.readyCount < this.players.length) {
      alert('Nem todos os jogadores estão prontos!');
      return;
    }
    alert('O jogo vai começar!');

    this.socketService.emit('room:startGame', { roomId: this.roomId });
  }

  // Copies the link of the room
  copyInviteLink() {
    navigator.clipboard.writeText(globalThis.location.href);
    alert('Link da sala copiado!');
  }
}
