import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AnswerCard, PlayerResponse, IncompleteGame, RoundResponse } from 'cah-shared';
import { GameService } from '../../../services/room/game/game.service';
import { filter, interval, map, Subject, switchMap, takeUntil, takeWhile } from 'rxjs';
import { PlayerList } from './player-list/player-list';
import { CommonModule } from '@angular/common';

// TODO: make this the same for frontend and backend
const ROUND_DURATION = 30_000;
const getCounterNumber = (endsAt: number) => {
  const remainingMs = endsAt - Date.now();
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return Math.max(0, remainingSeconds);
};

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

  // Signals for reactive streams
  game = signal<IncompleteGame | null>(null);
  round = signal<RoundResponse | null>(null);
  handPick = signal<AnswerCard[]>([]);

  currentPlayer = signal<PlayerResponse | null>(null);
  counter = signal<number>(ROUND_DURATION / 1000);

  // Signals for user interaction
  selectedAnswerCard = signal<AnswerCard | null>(null);
  hasSubmitted = signal<boolean>(false);

  constructor(protected readonly gameService: GameService) {}

  ngOnInit() {
    // Subscribe to reactive streams from the service
    this.gameService.game$.pipe(takeUntil(this.destroy$)).subscribe((game) => this.game.set(game));

    // TODO: fix "DRAWING_CARDS"
    this.gameService.round$
      .pipe(
        takeUntil(this.destroy$),
        filter((round): round is RoundResponse => !!round),
        switchMap((round) =>
          interval(500).pipe(
            takeWhile(() => round.status === 'DRAWING_CARDS'),
            map(() => getCounterNumber(round.endsAt)),
            takeWhile((x) => x > 0, true),
          ),
        ),
      )
      .subscribe((counter) => {
        this.counter.set(counter);
      });

    this.gameService.round$.pipe(takeUntil(this.destroy$)).subscribe((round) => {
      this.round.set(round);
    });

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
