import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { RoomResponse, RoomUser, SocketError } from '../../services/room/room.types';
import { LoadingSkeleton } from '../../loading-skeleton/loading-skeleton';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule, RouterLink, LoadingSkeleton],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomComponent implements OnInit, OnDestroy {
  // Properties

  // Placeholder data
  roomId: string | null = null;
  protected room = signal<RoomResponse | null>(null);
  protected errorMessage = signal<string | null>(null);

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly socketService: SocketService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
  }

  ngOnInit() {
    // Entrar na sala
    this.socketService.emit('room:join', { roomId: this.roomId });

    // Ouvir eventos do servidor
    this.subscriptions.push(
      this.socketService.listen<RoomResponse>('room:update').subscribe((room) => {
        console.log('Room update:', room, 4191);
        this.room.set(room);
      }),

      this.socketService.listen<SocketError>('error').subscribe((error) => {
        if (error.type === 'not-found') {
          this.errorMessage.set(error.message + '. Redirecting...');

          setTimeout(() => {
            console.log("NAVIGATE", 1419)
            this.router.navigate(['/home']);
          }, 3000);
        } else {
          this.errorMessage.set(error.message);
        }
        console.log('Room error:', error.type, '\n', error.message);
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

  get players(): RoomUser[] {
    const room = this.room();
    return room ? room.users : [];
  }

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
