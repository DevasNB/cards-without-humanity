import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../game/game';
import { Lobby } from '../lobby/lobby';

@Component({
  standalone: true,
  selector: 'room',
  imports: [CommonModule, FormsModule, Game, Lobby],
  templateUrl: './room.html',
  styleUrl: './room.css',
})
export class RoomComponent {
  protected _isGameOnGoing = false;

  protected set isGameOnGoing(value: boolean) {
    this._isGameOnGoing = value;
  }

  protected setGameStarted() {
    this._isGameOnGoing = true;
  }
}
