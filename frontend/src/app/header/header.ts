import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { UserResponse } from 'cah-shared';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    protected readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get user(): UserResponse | null {
    return this.authService.currentUser();
  }

  toggleLogin(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout().subscribe();
    } else {
      this.router.navigate(['/login']);
    }
  }
}
