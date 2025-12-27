import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { AnswerCard, PlayerResponse, IncompleteGame, RoundResponse, RoundPick } from 'cah-shared';
import { GameService } from '../../../services/room/game/game.service';
import {
  combineLatest,
  filter,
  interval,
  map,
  Subject,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs';
import { PlayerList } from './player-list/player-list';
import { CommonModule } from '@angular/common';

// TODO: make this the same for frontend and backend
const ROUND_DURATION = 30_000;
const getCounterNumber = (endsAt: number) => {
  const remainingMs = endsAt - Date.now();
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return Math.max(0, remainingSeconds);
};

interface GameData {
  game: IncompleteGame;
  round: RoundResponse;
  handPick: AnswerCard[];
}

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
  data = computed<GameData | null>(() => {
    const game = this.game();
    const round = this.round();
    const handPick = this.handPick();

    if (!game || !round || !handPick) return null;
    return { game, round, handPick };
  });
  game = signal<IncompleteGame | null>(null);
  round = signal<RoundResponse | null>(null);
  handPick = signal<AnswerCard[]>([]);

  isCzar = signal<boolean>(false);

  currentPlayer = signal<PlayerResponse | null>(null);
  counter = signal<number>(ROUND_DURATION / 1000);

  // Signals for user interaction
  selectedAnswerCard = signal<AnswerCard | null>(null);
  hasSubmittedAnswerCard = signal<boolean>(false);

  selectedRoundPick = signal<RoundPick | null>(null);
  hasSubmittedRoundPick = signal<boolean>(false);

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
            map(() => getCounterNumber(round.endsAt)),
            takeWhile((x) => x > 0 || x < Date.now(), true),
          ),
        ),
      )
      .subscribe((counter) => {
        this.counter.set(counter);
      });

    this.gameService.round$.pipe(takeUntil(this.destroy$)).subscribe((round) => {
      this.round.set(round);
      this.isCzar.set(round?.czar.username === this.currentPlayer()?.username);
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
    if (!this.canSubmitAnswerCard()) return;

    this.selectedAnswerCard.set(card);
  }

  protected selectRoundPick(card: RoundPick): void {
    if (!this.canVote()) return;

    this.selectedRoundPick.set(card);
  }

  /**
   * Called when the user submits their chosen answer card.
   * Emits the event to the server to record the submission.
   */
  protected handleCardSubmit(): void {
    if (!this.canSubmitAnswerCard()) return;

    const card = this.selectedAnswerCard();
    if (!card) return;

    this.gameService.submitWhiteCard(card);
    this.hasSubmittedAnswerCard.set(true);
  }

  protected isCardWinner(card: RoundPick): boolean {
    const round = this.round();
    if (!round) return false;

    const winnerPick = round.picks.find((p) => p.isWinner);
    if (!winnerPick) return false;

    return winnerPick.id === card.id;
  }

  /**
   * Called when the user submits their chosen round pick.
   * Emits the event to the server to record the submission.
   */
  protected handleVoting(): void {
    if (!this.canVote()) return;

    const card = this.selectedRoundPick();
    if (!card) return;

    this.gameService.submitRoundPick(card);
    this.hasSubmittedRoundPick.set(true);
  }

  protected canSubmitAnswerCard(): boolean {
    // TODO: fix 'DRAWING_CARDS'
    return (
      !this.hasSubmittedAnswerCard() && !this.isCzar() && this.round()?.status === 'DRAWING_CARDS'
    );
  }

  protected canVote(): boolean {
    // TODO: fix CZAR_VOTING
    return !this.hasSubmittedRoundPick() && this.isCzar() && this.round()?.status === 'CZAR_VOTING';
  }
}
