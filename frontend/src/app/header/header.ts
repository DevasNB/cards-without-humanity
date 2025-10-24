import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UserResponse } from '../auth/auth.types';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get user(): UserResponse | null {
    return this.authService.currentUser();
  }

  toggleLogin(): void {
    if (this.isAuthenticated) {
      this.authService.logout().subscribe();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
