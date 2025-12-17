import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeckService } from '../../../services/deck/deck.service';
import { OnInit, signal } from '@angular/core';
import { ListedDeck } from '../../../services/deck/deck.types';

@Component({
  standalone: true,
  selector: 'app-list-decks',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list-decks.html',
  styleUrl: './list-decks.css',
})
export class DecksListComponent implements OnInit {
  decks = signal<ListedDeck[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private readonly decksService: DeckService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.decksService.getDecks().subscribe({
      next: (decks) => {
        this.decks.set(decks);
        this.loading.set(false);
      },
      error: () => {
        this.decks.set([]);
        this.loading.set(false);
      },
    });
  }

  goToDeck(deckId: string) {
    this.router.navigate(['/deck', deckId]);
  }
}
