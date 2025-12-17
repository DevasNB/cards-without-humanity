import { Component, computed, input, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RoomResponse, RoomUserResponse } from 'cah-shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby-player-list',
  imports: [CommonModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  // ---------------------------
  // Inputs & Outputs
  // ---------------------------

  users = input<RoomUserResponse[]>([]);
  maxPlayers = input<number>(0);
  readyCount = computed(() => this.users().filter((u) => u.status === 'READY').length);
}
