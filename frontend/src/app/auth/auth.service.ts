// src/app/auth/auth.service.ts
import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CreateUserRequestBody,
  UserResponse, // Ensure these types match your backend's types
} from './auth.types'; // Define these types in a local file, see step 2.1

@Injectable({
  providedIn: 'root', // Makes the service a singleton available everywhere
})
export class AuthService {
  private readonly apiUrl = environment.backendApiUrl + '/auth';

  // Signals for reactive state management (modern Angular)
  currentUser: WritableSignal<UserResponse | null> = signal(null);
  isAuthenticated: WritableSignal<boolean> = signal(false);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.fetchCurrentUser();
  }

  // --- API Calls ---

  register(userData: CreateUserRequestBody): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => this.setAuth(response)),
      catchError(this.handleError),
    );
  }

  login(loginData: CreateUserRequestBody): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login/anonymous`, loginData).pipe(
      tap((response) => this.setAuth(response)),
      catchError(this.handleError),
    );
  }

  logout(): Observable<object> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.resetAuth()),
      catchError(this.handleError),
    );
  }

  // Fetches current user info from backend (requires token in header)
  // This is typically called on app load or after a token refresh
  // Called on service initialization to check for existing token
  fetchCurrentUser(): void {
    this.http
      .get<UserResponse>(`${this.apiUrl}/me`)
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        }),
        catchError((error) => {
          // If /me fails (e.g., token expired/invalid), remove auth
          this.logout().subscribe();
          return throwError(() => error); // Re-throw the error
        }),
      )
      .subscribe({
        error: (err) => console.error('Failed to load user from token:', err),
      });
  }

  // --- Token Management ---

  private setAuth(user: UserResponse): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    // You might want to navigate to a dashboard here
    this.router.navigate(['/home']);
  }

  private resetAuth(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/home']);
  }

  // --- Error Handling ---

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error?.error) {
      errorMessage = error.error.error; // Backend sends { error: "message" }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Network or CORS error (status 0)
    if (error.status === 0) {
      errorMessage =
        'Não foi possível comunicar com o servidor. Verifica a tua ligação à internet ou se o servidor está ativo.';
    }

    // 400 – Bad Request
    else if (error.status === 400) {
      errorMessage = error.error?.message || 'Pedido inválido. Verifica os dados enviados.';
    }

    /*
    // 401 – Unauthorized
    else if (error.status === 401) {
      errorMessage = 'Credenciais inválidas. Verifica o username.';
    }

    // 403 – Forbidden
    else if (error.status === 403) {
      errorMessage = 'Não tens permissão para executar esta ação.';
    }

    // 404 – Not Found
    else if (error.status === 404) {
      errorMessage = 'O recurso solicitado não foi encontrado.';
    }
      */

    // 500+ – Server error
    else if (error.status >= 500) {
      errorMessage = 'Ocorreu um erro no servidor. Tenta novamente mais tarde.';
    }

    console.error(`❌ [HTTP ${error.status}] ${error.url || ''}\nBody:`, error.error);

    return throwError(() => new Error(errorMessage));
  }
}
