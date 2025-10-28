import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { RoomResponse } from '../../services/room/room.types';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomComponent implements OnInit, OnDestroy {
  // Properties

  // Placeholder data
  roomId: string | null = null;
  room = signal<RoomResponse | null>(null);

  players: RoomUser[] = [];

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly socketService: SocketService,
    private readonly route: ActivatedRoute,
  ) {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  ngOnInit() {
    // Entrar na sala
    this.socketService.emit('room:join', { roomId: this.roomId });

    // Ouvir eventos do servidor
    this.subscriptions.push(
      this.socketService.listen<RoomResponse>('room:update').subscribe((room) => {
        this.room.set(room);
      }),

      /*
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
      */
    );
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) s.unsubscribe();

    this.socketService.emit('room:leave', { roomId: this.roomId });
  }

  // Getters

  // Counts the total number of players that are ready
  get readyCount(): number {
    return this.players.filter((p) => p.status === 'READY').length;
  }

  // Methods

  // Toggles the privacy of the room
  togglePrivacy() {
    const room = this.room();
    if (!room) return;

    this.room.update((current) => {
      if (!current) return current; // handle null safely
      return { ...current, isPublic: !current.isPublic };
    });

    this.socketService.emit('room:updateSettings', {
      roomId: this.roomId,
      isPublic: room.isPublic,
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
