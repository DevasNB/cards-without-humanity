import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { CreateLobbyComponent } from './features/lobby/create-lobby/create-lobby';
import { JoinLobbyComponent } from './features/lobby/join-lobby/join-lobby';
import { ListDecksComponent } from './features/decks/list-decks/list-decks';
import { CreateDeckComponent } from './features/decks/create-deck/create-deck';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },

  // Lobby Routes
  { path: 'lobby/create-lobby', component: CreateLobbyComponent },
  { path: 'lobby/join-lobby', component: JoinLobbyComponent },

  // Decks Routes
  { path: 'decks/list-decks', component: ListDecksComponent },
  { path: 'decks/create-deck', component: CreateDeckComponent },

  { path: '**', redirectTo: 'home' },
];
