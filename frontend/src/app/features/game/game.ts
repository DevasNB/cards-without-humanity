import { Component, OnInit, signal } from '@angular/core';

interface BlackCard {
  id: number;
  text: string;
}

interface WhiteCard {
  id: number;
  text: string;
}

@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game implements OnInit {
  handPick: WhiteCard[] = [
    { id: 1, text: 'Um croissant radioativo' },
    { id: 2, text: 'Dançar o samba num funeral' },
    { id: 3, text: 'Um pato com uma missão' },
    { id: 4, text: 'A tua professora preferida de matemática' },
    { id: 5, text: 'Um telefonema às 3 da manhã' },
    { id: 6, text: 'Uma sandes de atum filosófica' },
  ];

  currentBlack = signal<BlackCard | null>(null);
  selectedWhite = signal<WhiteCard | null>(null);

  ngOnInit() {
    this.drawBlackCard();
  }

  drawBlackCard() {
    const nextCard = { id: 1, text: 'O próximo grande lançamento da Apple: ____.' };
    this.currentBlack.set(nextCard);
    this.selectedWhite.set(null);
  }

  selectWhiteCard(card: WhiteCard) {
    this.selectedWhite.set(card);
  }

  nextRound() {
    this.drawBlackCard();
  }

  confirmSelection() {}
}
