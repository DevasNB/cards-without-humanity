import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { GameResponse, RoundResponse, AnswerCard, PlayerResponse } from 'cah-shared';
import { GameService } from '../../../services/room/game/game.service';
import { Subject, takeUntil } from 'rxjs';
import { PlayerList } from './player-list/player-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  imports: [CommonModule, PlayerList],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit, OnDestroy {
  // Receive the required input
  // Game from parent
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive UI
  game = signal<GameResponse | null>(null);
  handPick = signal<AnswerCard[]>([]);
  currentPlayer = signal<PlayerResponse | null>(null);

  private readonly _selectedAnswerCard = signal<AnswerCard | null>(null);
  selectAnswerCard(value: AnswerCard) {
    this._selectedAnswerCard.set(value);
  }
  get selectedAnswerCard() {
    return this._selectedAnswerCard;
  }

  constructor(protected readonly gameService: GameService) {
    // TODO: this.socketService.emit('game:join');
  }

  ngOnInit() {
    // Subscribe to reactive streams from the service
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe((game) => this.game.set(game));

    this.gameService.handPick$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cards) => this.handPick.set(cards));

    this.gameService.currentPlayer$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => this.currentPlayer.set(user));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Methods

  /**
   * Called when the user submits their chosen answer card.
   * Emits the event to the server to record the submission.
   */
  handleAnswerCardSubmit() {
    const card = this.selectedAnswerCard();

    if (card) {
      this.gameService.submitWhiteCard(card);
    }
  }
}
