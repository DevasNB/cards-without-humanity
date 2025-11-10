// src/app/lobby/create-lobby/create-lobby.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-create-lobby',

  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-lobby.html',
  styleUrl: './create-lobby.css',
})
export class CreateLobbyComponent {
  // Define the form structure
  lobbyForm = new FormGroup({
    roomName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    maxPlayers: new FormControl(8, [Validators.required, Validators.min(2), Validators.max(10)]),
  });

  // Method to handle form submission
  createLobby() {
    if (this.lobbyForm.valid) {
      console.log('Form Submitted!', this.lobbyForm.value);
      // TODO: Send this data to your Node.js server via a service
      // Example: this.gameService.createLobby(this.lobbyForm.value);
    } else {
      console.error('Form is invalid');
    }
  }
}
