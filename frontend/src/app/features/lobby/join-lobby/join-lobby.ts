import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-join-lobby',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './join-lobby.html',
  styleUrl: './join-lobby.css',
})
export class JoinLobbyComponent {
  joinLobbyForm = new FormGroup({
    // Validação para um código de sala de 6 caracteres maiúsculos, por exemplo.
    roomCode: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z0-9]{6}$/)]),
  });

  joinLobby() {
    if (this.joinLobbyForm.valid) {
      console.log('A tentar entrar na sala com o código:', this.joinLobbyForm.value.roomCode);
      // TODO: Enviar o código para o servidor para entrar na sala
    } else {
      console.error('Código da sala inválido.');
    }
  }
}
