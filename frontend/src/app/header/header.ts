import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { UserResponse } from 'cah-shared';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly destroy$ = new Subject<void>();

  constructor(
    protected readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get user(): UserResponse | null {
    return this.authService.currentUser();
  }

  toggleLogin(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout().pipe(takeUntil(this.destroy$)).subscribe();
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
