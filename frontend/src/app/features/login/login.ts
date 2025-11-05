// src/app/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common'; // For ngIf, etc.
import { UserResponse } from '../../services/auth/auth.types';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule], // Import standalone dependencies
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  username: string = '';
  returnUrl: string = '';

  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  loginResponse = signal<UserResponse | null>(null);

  constructor(
    protected readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  onLogin(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.loginResponse.set(null);

    this.authService.login({ username: this.username }).subscribe({
      next: (response) => {
        // AuthService handles navigation on success
        console.log('Login successful!', response);
        this.loginResponse.set(response);
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Login failed.');
        console.error('Login error:', error);

        this.isLoading.set(false);
      },
    });
  }

  changeUsername(event: string): void {
    this.username = event;
    this.errorMessage.set(null);
  }
}
