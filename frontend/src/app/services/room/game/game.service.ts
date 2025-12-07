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
} from '../room.types';
import { AuthService } from '../../auth/auth.service';

// game.service.ts
@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly gameSubject = new BehaviorSubject<GameResponse | null>(null);
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
    this.socketService.listen<StartingGamePayload>('room:initGame').subscribe((game) => {
      this.gameSubject.next(game.game);
      this.handPickSubject.next(game.handPick);
    });

    // New round
    this.socketService.listen<MiddleGamePayload>('game:round:new').subscribe((update) => {
      this.roundSubject.next(update.round);
      this.handPickSubject.next(update.newCards);
      // this.drawBlackCard(); -> already in roundSubject
    });

    // Errors
    this.socketService
      .listen<SocketError>('error')
      .subscribe((err) => console.error('Game error:', err));
  }

  // Actions

  /** Called from GamePage (not from presentational components!) */
  joinGame(): void {
    this.socketService.emit('game:join');
  }

  /** Called from presentational component through GamePage */
  submitWhiteCard(card: AnswerCard): void {
    this.socketService.emit('game:selectCard', { cardId: card.id });
  }
}
