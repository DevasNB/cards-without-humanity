// src/app/auth/login/login.component.ts
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common'; // For ngIf, etc.
import { UserResponse } from '../../services/auth/auth.types';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule], // Import standalone dependencies
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  username: string = '';

  errorMessage: string | null = null;
  isLoading: boolean = false;
  loginResponse: UserResponse | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  onLogin(): void {
    this.errorMessage = null;
    this.isLoading = true;
    this.loginResponse = null;

    this.authService.login({ username: this.username }).subscribe({
      next: (response) => {
        // AuthService handles navigation on success
        console.log('Login successful!', response);
        this.loginResponse = response;

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed.';
        console.error('Login error:', error);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  changeUsername(event: string): void {
    this.username = event;
    this.errorMessage = null;
  }
}
