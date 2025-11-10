import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { AuthService } from './services/auth/auth.service';
import { LoadingSkeleton } from './loading-skeleton/loading-skeleton';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, Header, LoadingSkeleton],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly authService = inject(AuthService);
}
