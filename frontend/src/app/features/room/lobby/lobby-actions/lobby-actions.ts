import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoomUserResponse } from 'cah-shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby-actions',
  imports: [CommonModule],
  templateUrl: './lobby-actions.html',
  styleUrl: './lobby-actions.css',
})
export class LobbyActions {
  // Room from parent
  private _user!: RoomUserResponse;
  @Input()
  set user(value: RoomUserResponse) {
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
