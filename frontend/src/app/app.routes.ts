import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import {CreateRoomComponent} from "./features/rooms/create-room/create-room";

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'create-room', component: CreateRoomComponent },
  { path: '**', redirectTo: 'home' },
];
