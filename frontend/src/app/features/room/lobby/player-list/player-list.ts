import { Component, computed, Input } from '@angular/core';
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
  @Input() room!: RoomResponse;
  @Input() users!: RoomUserResponse[];

  protected readonly readyCount = computed(
    () => this.users.filter((u) => u.status === 'READY').length,
  );
}
