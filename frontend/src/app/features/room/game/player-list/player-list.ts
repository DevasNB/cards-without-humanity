import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { PlayerResponse } from '../../../../services/room/room.types';

@Component({
  selector: 'app-game-player-list',
  imports: [CommonModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  private readonly _players = signal<PlayerResponse[]>([]);
  private readonly _currentUser = signal<string | null>(null);
  private readonly _cardCzar = signal<string | null>(null);

  @Input()
  set players(value: PlayerResponse[]) {
    this._players.set(value ?? []);
  }
  @Input()
  set currentUser(username: string | null) {
    this._currentUser.set(username);
  }
  @Input()
  set cardCzar(username: string | null) {
    this._cardCzar.set(username);
  }

  // Automatically sorted leaderboard
  leaderboard = computed(() => [...this._players()].sort((a, b) => b.points - a.points));

  isCurrentUser = (username: string) => this._currentUser() === username;

  isCardCzar = (username: string) => this._cardCzar() === username;
}
