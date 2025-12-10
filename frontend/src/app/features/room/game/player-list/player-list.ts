import { CommonModule } from '@angular/common';
import { Component, computed, Input, signal } from '@angular/core';
import { PlayerResponse } from 'cah-shared';

@Component({
  selector: 'app-game-player-list',
  imports: [CommonModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  private readonly _players = signal<PlayerResponse[]>([]);
  private readonly _currentUser = signal<PlayerResponse | null>(null);
  private readonly _czar = signal<PlayerResponse | null>(null);

  @Input()
  set players(value: PlayerResponse[]) {
    this._players.set(value ?? []);
  }
  @Input()
  set currentUser(username: PlayerResponse | null) {
    this._currentUser.set(username);
  }
  @Input()
  set czar(user: PlayerResponse | null) {
    this._czar.set(user);
  }

  // Automatically sorted leaderboard
  leaderboard = computed(() => [...this._players()].sort((a, b) => b.points - a.points));

  isCurrentUser = (username: PlayerResponse) => this._currentUser()?.id === username.id;

  isCardCzar = (player: PlayerResponse) => this._czar()?.id === player.id;
}
