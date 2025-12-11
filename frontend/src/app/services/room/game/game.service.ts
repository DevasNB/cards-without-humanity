import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SocketService } from '../../socket.service';
import {
  GameResponse,
  StartingGamePayload,
  AnswerCard,
  RoundResponse,
  SocketError,
  MiddleGamePayload,
  PlayerResponse,
} from 'cah-shared';
import { AuthService } from '../../auth/auth.service';

// game.service.ts
@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly gameSubject = new BehaviorSubject<GameResponse | null>(null);
  game$ = this.gameSubject.asObservable();

  private readonly handPickSubject = new BehaviorSubject<AnswerCard[]>([]);
  handPick$ = this.handPickSubject.asObservable();

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
    this.socketService.listen('room:initGame').subscribe((game) => {
      this.gameSubject.next(game.game);
      this.handPickSubject.next(game.handPick);
    });

    // New round
    this.socketService.listen('game:update').subscribe((update) => {
      // this.gameSubject.next(update.game);
      // this.handPickSubject.next(update.newCards);
      // this.drawBlackCard(); -> already in roundSubject
    });

    // Errors
    this.socketService.listen('error').subscribe((err) => console.error('Game error:', err));
  }

  // Actions

  /** Called from GamePage (not from presentational components!) */
  joinGame(): void {
    this.socketService.emit('game:join');
  }

  /** Called from presentational component through GamePage */
  submitWhiteCard(card: AnswerCard): void {
    // this.socketService.emit('game:selectCar', { cardId: card.id });
  }
}
