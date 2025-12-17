// src/app/services/socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClientToServerEvents, ServerToClientEvents } from 'cah-shared';

type EventPayload<E extends keyof ServerToClientEvents> = ServerToClientEvents[E] extends (
  payload: infer P,
) => void
  ? P
  : never;

@Injectable()
export class SocketService implements OnDestroy {
  private readonly socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  // Emitir eventos
  emit<E extends keyof ClientToServerEvents>(
    event: E,
    ...data: Parameters<ClientToServerEvents[E]>
  ) {
    this.socket.emit(event, ...data);
  }

  // Listen events as Observable (type-safe)
  listen<E extends keyof ServerToClientEvents>(event: E): Observable<EventPayload<E>> {
    return new Observable<EventPayload<E>>((subscriber) => {
      const listener = (data: EventPayload<E>) => subscriber.next(data);

      // Can have "as any" in listener because the function already enforces the type
      this.socket.on(event, listener as any);

      // Cleanup when unsubscribed
      return () => this.socket.off(event, listener as any);
    });
  }

  /**
   * Disconnects the socket to prevent any further events from being emitted.
   * This method is called when the user logs out of the application.
   */
  logout(): void {
    this.socket.disconnect();
  }

  /**
   * Called when the service is about to be destroyed.
   * Disconnects the socket to prevent any further events from being emitted.
   */
  ngOnDestroy(): void {
    this.logout();
  }
}
