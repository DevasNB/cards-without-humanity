import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuard } from './auth/auth.guard';
import { CreateRoomComponent } from './features/rooms/create-room/create-room';
import { LoginComponent } from './features/login/login';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'create-room', component: CreateRoomComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
