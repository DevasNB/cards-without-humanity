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
  // --- HARD CODED CARDS ---
  blackCards: BlackCard[] = [
    { id: 1, text: 'O próximo grande lançamento da Apple: ____.' },
    { id: 2, text: 'A melhor forma de surpreender os teus avós é ____.' },
    { id: 3, text: "Nada diz 'amor verdadeiro' como ____." },
  ];

  whiteCards: WhiteCard[] = [
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
    const random = Math.floor(Math.random() * this.blackCards.length);
    this.currentBlack.set(this.blackCards[random]);
    this.selectedWhite.set(null);
  }

  selectWhiteCard(card: WhiteCard) {
    this.selectedWhite.set(card);
  }

  nextRound() {
    this.drawBlackCard();
  }
}
