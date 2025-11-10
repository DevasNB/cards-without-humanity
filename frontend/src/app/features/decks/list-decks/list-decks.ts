import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-list-decks',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-decks.html',
  styleUrl: './list-decks.css',
})
export class ListDecksComponent {
  // Dados de exemplo que viriam do teu servidor Node.js
  decks = [
    {
      name: 'Baralho Padrão',
      description: 'O conjunto de cartas clássico para começar.',
      cardCount: 550,
    },
    {
      name: 'Expansão PT-PT',
      description: 'Cartas com referências e humor português.',
      cardCount: 150,
    },
    {
      name: 'Baralho da Ciência',
      description: 'Para os nerds que gostam de piadas inteligentes.',
      cardCount: 100,
    },
    {
      name: 'Absurd Box',
      description: 'Uma coleção de cartas completamente sem sentido.',
      cardCount: 300,
    },
  ];
}
