// src/app/services/room/room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreateRoomResponse, ListedRoom } from 'cah-shared';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiUrl = environment.backendApiUrl + '/rooms';

  constructor(private readonly http: HttpClient) {}

  // --- API Calls ---

  createRoom(): Observable<CreateRoomResponse> {
    return this.http
      .post<CreateRoomResponse>(`${this.apiUrl}/new`, {})
      .pipe(catchError(this.handleError));
  }

  getRooms(): Observable<ListedRoom[]> {
    return this.http.get<ListedRoom[]>(`${this.apiUrl}`).pipe(catchError(this.handleError));
  }

  // --- Error Handling ---

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (error.status === 0) {
      errorMessage =
        'Não foi possível comunicar com o servidor. Verifica a tua ligação à internet ou se o servidor está ativo.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Pedido inválido. Verifica os dados enviados.';
    } else if (error.status >= 500) {
      errorMessage = 'Ocorreu um erro no servidor. Tenta novamente mais tarde.';
    }

    console.error(`❌ [HTTP ${error.status}] ${error.url || ''}\nBody:`, error.error);

    return throwError(() => new Error(errorMessage));
  }
}
