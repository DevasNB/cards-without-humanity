import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { SocketService } from '../../socket.service';
import { AnswerCard, PlayerResponse, IncompleteGame, RoundResponse, RoundPick } from 'cah-shared';
import { AuthService } from '../../auth/auth.service';

// game.service.ts
@Injectable()
export class GameService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly gameSubject = new BehaviorSubject<IncompleteGame | null>(null);
  game$ = this.gameSubject.asObservable();

  private readonly handPickSubject = new BehaviorSubject<AnswerCard[]>([]);
  handPick$ = this.handPickSubject.asObservable();

  private readonly roundSubject = new BehaviorSubject<RoundResponse | null>(null);
  round$ = this.roundSubject.asObservable();

  currentPlayer$: Observable<PlayerResponse | null> = this.game$.pipe(
    map((game) => {
      const auth = this.authService.currentUser();
      if (!game || !auth) return null;
      return game.players.find((u) => u.username === auth.username) || null;
    }),
  );

  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
  ) {
    this.socketService
      .listen('room:game:new')
      .pipe(takeUntil(this.destroy$))
      .subscribe((game) => {
        this.gameSubject.next(game.game);
        this.socketService.emit('game:join');
      });

    // New round
    this.socketService
      .listen('game:round:new')
      .pipe(takeUntil(this.destroy$))
      .subscribe((update) => {
        console.log(update, 14941)
        this.roundSubject.next(update.round);

        this.handPickSubject.next(update.handPick);
      });

    this.socketService
      .listen('game:round:update')
      .pipe(takeUntil(this.destroy$))
      .subscribe((update) => {
        this.roundSubject.next(update.round);

        const lastGame = this.gameSubject.getValue();
        if (update.players && lastGame) {
          this.gameSubject.next({ ...lastGame, players: update.players });
          // TODO: fix this game:round:update
        }
      });

    this.socketService
      .listen('game:round:end')
      .pipe(takeUntil(this.destroy$))
      .subscribe((update) => {
        console.log(update, 2592);
        console.log(new Date(), new Date(update.round.endsAt), 25923)
        this.roundSubject.next(update.round);
      });

    // General game updates
    this.socketService.listen('game:update').subscribe((update) => {
      this.gameSubject.next(update);
    });

    // Errors
    this.socketService
      .listen('error')
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => console.error('Game error:', err));
  }

  // Actions

  /** Called from presentational component through GamePage */
  submitWhiteCard(card: AnswerCard): void {
    this.socketService.emit('game:card:select', { cardId: card.id });
  }

  /** Called from presentational component through GamePage */
  submitRoundPick(card: RoundPick): void {
    this.socketService.emit('game:czar:vote', { roundPickId: card.id });
  }

  // Cleanup
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
