import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ListDecksComponent } from './features/decks/list-decks/list-decks';
import { CreateDeckComponent } from './features/decks/create-deck/create-deck';
import { authGuard } from './services/auth/auth.guard';
import { RoomComponent } from './features/rooms/room';
import { LoginComponent } from './features/login/login';
import { RoomsListComponent } from './features/rooms-list/rooms-list';

export const routes: Routes = [
  { path: 'home', component: Home },

  // Decks Routes
  { path: 'decks/list-decks', component: ListDecksComponent },
  { path: 'decks/create-deck', component: CreateDeckComponent },

  { path: 'login', component: LoginComponent },
  { path: 'room/:roomId', component: RoomComponent, canActivate: [authGuard] },
  { path: 'rooms-list', component: RoomsListComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
