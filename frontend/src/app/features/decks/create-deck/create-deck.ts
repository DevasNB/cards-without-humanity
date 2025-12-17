import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Definimos um tipo para as nossas cartas para ser mais claro
type Card = {
  id: number;
  type: 'prompt' | 'response';
  content: string;
  numResponses?: number; // O '?' torna esta propriedade opcional
};

@Component({
  standalone: true,
  selector: 'app-create-deck',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-deck.html',
  styleUrl: './create-deck.css',
})
export class CreateDeckComponent implements OnInit, AfterViewInit {
  @ViewChildren('carouselCard') cardElements!: QueryList<ElementRef<HTMLDivElement>>;
  private readonly destroy$ = new Subject<void>();

  stepIndex: number = 1;
  stepTitle: string = '';
  createDeckForm!: FormGroup;

  // UM ÚNICO ARRAY PARA TODAS AS CARTAS
  allCards: Card[] = [];
  nextId: number = 1;
  currentIndex = 0;

  // O histórico agora guarda o estado do array único
  historyStack: { cards: Card[] }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit() {
    this.initDeckForm();
    this.updateStepTitle();
  }

  ngAfterViewInit() {
    this.cardElements.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectedCard(this.currentIndex, 'auto');
    });
  }

  // --- Lógica de Passos e Submissão ---

  initDeckForm() {
    this.createDeckForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(5)]],
      description: [
        '',
        [Validators.required, Validators.maxLength(1000), Validators.minLength(15)],
      ],
      isPublic: [true, [Validators.required]],
    });
  }

  nextStep() {
    this.stepIndex = 2;
    this.updateStepTitle();
    // Inicia com uma carta de cada tipo se o carrossel estiver vazio
    if (this.allCards.length === 0) {
      this.addCard('prompt');
      this.addCard('response');
    }
  }

  previousStep() {
    this.stepIndex = 1;
    this.updateStepTitle();
  }

  updateStepTitle() {
    this.stepTitle =
      this.stepIndex === 1 ? 'Passo 1 de 2: Detalhes do Baralho' : 'Passo 2 de 2: Adicionar Cartas';
  }

  // As funções de validação agora filtram o array único
  validatePromptCards = () => {
    const prompts = this.allCards.filter((c) => c.type === 'prompt');
    return prompts.length > 0 && prompts.every((c) => c.content.trim() && c.numResponses! >= 1);
  };
  validateResponseCards = () => {
    const responses = this.allCards.filter((c) => c.type === 'response');
    return responses.length > 0 && responses.every((c) => c.content.trim());
  };

  submitDeck() {
    if (!this.validatePromptCards() || !this.validateResponseCards()) {
      alert(
        'Verifica se todas as cartas estão preenchidas e se as cartas pretas têm pelo menos um espaço em branco.',
      );
      return;
    }
    // Separa as cartas para o payload final
    const payload = {
      ...this.createDeckForm.value,
      promptCards: this.allCards
        .filter((c) => c.type === 'prompt')
        .map((c) => ({ content: c.content, numResponses: c.numResponses })),
      responseCards: this.allCards
        .filter((c) => c.type === 'response')
        .map((c) => ({ content: c.content })),
    };
    console.log('--- DECK PRONTO PARA SER ENVIADO ---', payload);
    alert('Baralho criado com sucesso! Vê a consola (F12).');
    this.router.navigate(['/']);
  }

  // --- Função Desfazer (Undo) ---

  saveState() {
    // Guarda uma cópia profunda do estado atual do array de cartas
    this.historyStack.push({ cards: JSON.parse(JSON.stringify(this.allCards)) });
  }

  undo() {
    if (this.historyStack.length === 0) return;
    const lastState = this.historyStack.pop();
    if (lastState) {
      this.allCards = lastState.cards;
      // Garante que o índice não fica fora dos limites após desfazer
      if (this.currentIndex >= this.allCards.length) {
        this.currentIndex = this.allCards.length - 1;
      }
    }
  }

  // --- Funções do Carrossel e das Cartas ---

  navigate(direction: 'prev' | 'next') {
    const newIndex = direction === 'prev' ? this.currentIndex - 1 : this.currentIndex + 1;
    if (newIndex >= 0 && newIndex < this.allCards.length) {
      this.selectedCard(newIndex);
    }
  }

  selectedCard(index: number, behavior: ScrollBehavior = 'smooth') {
    this.currentIndex = index;
    const cardElement = this.cardElements?.toArray()[index]?.nativeElement;
    if (cardElement) {
      cardElement.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    }
  }

  addCard(type: 'prompt' | 'response') {
    this.saveState();
    const newCard: Card =
      type === 'prompt'
        ? { id: this.nextId++, type: 'prompt', content: '', numResponses: 0 }
        : { id: this.nextId++, type: 'response', content: '' };
    this.allCards.push(newCard);
  }

  removeCard(indexToDelete: number, event: MouseEvent) {
    event.stopPropagation();
    this.saveState();

    if (this.allCards.length <= 1) return;

    const currentlyFocusedIndex = this.currentIndex;
    this.allCards.splice(indexToDelete, 1);

    if (indexToDelete === currentlyFocusedIndex) {
      if (this.currentIndex > 0) this.currentIndex--;
    } else if (indexToDelete < currentlyFocusedIndex) {
      this.currentIndex--;
    }

    setTimeout(() => this.selectedCard(this.currentIndex, 'smooth'), 0);
  }

  updateCardText(index: number, event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const card = this.allCards[index];
    card.content = target.value;
    if (card.type === 'prompt') {
      card.numResponses = target.value.match(/_____/g)?.length || 0;
    }
  }

  addWhiteSpace() {
    const card = this.allCards[this.currentIndex];
    if (card && card.type === 'prompt') {
      card.content += '_____ ';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
