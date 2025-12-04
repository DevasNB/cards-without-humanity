import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomUser } from '../../../../services/room/room.types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby-actions',
  imports: [CommonModule],
  templateUrl: './lobby-actions.html',
  styleUrl: './lobby-actions.css',
})
export class LobbyActions {
  // Room from parent
  private _user!: RoomUser;
  @Input()
  set user(value: RoomUser) {
    this._user = value;
  }
  get user() {
    return this._user;
  }

  @Input() allReady!: boolean;

  @Output() statusToggle = new EventEmitter<void>();
  @Output() startGame = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
}
