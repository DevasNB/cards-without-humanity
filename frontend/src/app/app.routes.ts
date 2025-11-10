import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ListDecksComponent } from './features/decks/list-decks/list-decks';
import { CreateDeckComponent } from './features/decks/create-deck/create-deck';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },

  // Decks Routes
  { path: 'decks/list-decks', component: ListDecksComponent },
  { path: 'decks/create-deck', component: CreateDeckComponent },

  { path: '**', redirectTo: 'home' },
];
