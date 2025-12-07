import { Component, computed, Input } from '@angular/core';
import { RoomResponse, RoomUser } from '../../../../services/room/room.types';
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
  @Input() users!: RoomUser[];

  protected readonly readyCount = computed(
    () => this.users.filter((u) => u.status === 'READY').length,
  );
}
