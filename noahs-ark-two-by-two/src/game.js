import { MISMATCH_DELAY_MS } from './config.js';

const randomInt = (max) => Math.floor(Math.random() * max);

const shuffle = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const createCard = (animal, index) => ({
  id: `${animal.id}-${index}`,
  pairId: animal.id,
  name: animal.name,
  emoji: animal.emoji,
  fact: animal.fact,
  matched: false,
  flipped: false,
  element: null,
});

export class MemoryGame {
  constructor(options) {
    this.grid = options.grid;
    this.animals = options.animals;
    this.onMove = options.onMove || (() => {});
    this.onMatch = options.onMatch || (() => {});
    this.onMismatch = options.onMismatch || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.moves = 0;
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.selections = [];
    this.cards = [];
    this.locked = false;
  }

  start({ rows, cols }) {
    this.moves = 0;
    this.matchedPairs = 0;
    this.totalPairs = (rows * cols) / 2;
    this.locked = false;
    this.selections = [];

    const animalPool = shuffle(this.animals).slice(0, this.totalPairs);
    const deck = animalPool.flatMap((animal) => [
      createCard(animal, 'a'),
      createCard(animal, 'b'),
    ]);

    this.cards = shuffle(deck);
    this.renderGrid(cols);
  }

  renderGrid(columns) {
    this.grid.innerHTML = '';
    this.grid.style.setProperty('--columns', columns);

    this.cards.forEach((card) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'card';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${card.name} card`);
      button.innerHTML = `
        <span class="card-inner">
          <span class="card-face card-face--front" aria-hidden="true"></span>
          <span class="card-face card-face--back">
            <span class="card-emoji" aria-hidden="true">${card.emoji}</span>
          </span>
        </span>
      `;

      button.addEventListener('click', () => {
        this.handleCardSelection(card);
      });

      card.element = button;
      this.grid.appendChild(button);
    });
  }

  handleCardSelection(card) {
    if (this.locked || card.matched || this.selections.includes(card)) {
      return;
    }

    this.flipCard(card, true);
    this.selections.push(card);

    if (this.selections.length === 2) {
      this.moves += 1;
      this.onMove(this.moves);
      const [first, second] = this.selections;

      if (first.pairId === second.pairId) {
        this.matchCards(first, second);
      } else {
        this.mismatchCards(first, second);
      }
    }
  }

  matchCards(first, second) {
    first.matched = true;
    second.matched = true;

    first.element.classList.add('is-matched');
    second.element.classList.add('is-matched');
    first.element.setAttribute('aria-pressed', 'true');
    second.element.setAttribute('aria-pressed', 'true');
    first.element.disabled = true;
    second.element.disabled = true;

    this.matchedPairs += 1;
    const remaining = this.totalPairs - this.matchedPairs;

    this.onMatch({
      moves: this.moves,
      matchedPairs: this.matchedPairs,
      totalPairs: this.totalPairs,
      remainingPairs: remaining,
      fact: first.fact,
      name: first.name,
      emoji: first.emoji,
    });

    this.selections = [];

    if (this.matchedPairs === this.totalPairs) {
      this.onComplete({
        moves: this.moves,
      });
    }
  }

  mismatchCards(first, second) {
    this.locked = true;
    this.onMismatch({
      moves: this.moves,
    });

    window.setTimeout(() => {
      this.flipCard(first, false);
      this.flipCard(second, false);
      this.selections = [];
      this.locked = false;
    }, MISMATCH_DELAY_MS);
  }

  flipCard(card, flipped) {
    card.flipped = flipped;
    if (!card.element) {
      return;
    }
    card.element.classList.toggle('is-flipped', flipped);
    card.element.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  }
}
