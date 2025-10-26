// src/app/services/socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private readonly socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
    });
  }

  // Emitir eventos
  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  // Ouvir eventos (retorna Observable para uso com async pipe)
  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => subscriber.next(data));
    });
  }

  // Desconectar quando o serviço for destruído
  ngOnDestroy() {
    this.socket.disconnect();
  }
}
