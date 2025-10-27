import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuard } from './services/auth/auth.guard';
import { RoomComponent } from './features/rooms/room';
import { LoginComponent } from './features/login/login';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'room/:roomId', component: RoomComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
