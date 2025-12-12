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

  selectedAnswerCard = signal<AnswerCard | null>(null);
  hasSubmitted = signal<boolean>(false);

  constructor(protected readonly gameService: GameService) {}

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

  protected selectCard(card: AnswerCard): void {
    if (this.hasSubmitted()) return;

    this.selectedAnswerCard.set(card);
  }

  /**
   * Called when the user submits their chosen answer card.
   * Emits the event to the server to record the submission.
   */
  handleAnswerCardSubmit() {
    if (this.hasSubmitted()) return;

    const card = this.selectedAnswerCard();

    if (card) {
      this.gameService.submitWhiteCard(card);
      this.hasSubmitted.set(true);
    }
  }
}
