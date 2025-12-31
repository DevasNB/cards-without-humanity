// src/app/auth/login/login.component.ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms'; // Required for ngModel
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common'; // For ngIf, etc.
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // Import standalone dependencies
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly returnUrl: string = '';

  // Formulário
  protected loginForm!: FormGroup;

  protected errorMessage = signal<string | null>(null);
  protected isLoading = signal<boolean>(false);

  constructor(
    protected readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicia o formulario para o login
  private initializeForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
    });
  }

  protected onLogin(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Fill all fields');
      return;
    }

    this.authService
      .login({ username: this.loginForm.value.username })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loginResponse) => {
          // AuthService handles navigation on success
          console.log('Login successful!', loginResponse);
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
}
