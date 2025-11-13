import {
  BUILD_VERSION,
  VERSES,
  STORAGE_KEYS,
} from './config.js';

const dom = {
  verseBody: document.querySelector('#verse-body'),
  verseReference: document.querySelector('#verse-reference'),
  verseMode: document.querySelector('#verse-mode'),
  choicesWrapper: document.querySelector('#choices-wrapper'),
  checkButton: document.querySelector('#check-answer'),
  nextButton: document.querySelector('#next-verse'),
  accuracy: document.querySelector('#accuracy'),
  versesPlayed: document.querySelector('#verses-played'),
  streak: document.querySelector('#streak'),
};

const loadNumber = (key, fallback = 0) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) {
      return fallback;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  } catch {
    return fallback;
  }
};

const saveNumber = (key, value) => {
  try {
    window.localStorage.setItem(key, value.toString());
  } catch {
    // Ignore storage failures (private browsing, etc.)
  }
};

const state = {
  verse: null,
  previousVerseId: null,
  selections: {},
  revealed: false,
  stats: {
    streak: loadNumber(STORAGE_KEYS.STREAK),
    totalPlayed: loadNumber(STORAGE_KEYS.TOTAL_PLAYED),
    totalBlanks: loadNumber(STORAGE_KEYS.TOTAL_BLANKS),
    correctAnswers: loadNumber(STORAGE_KEYS.CORRECT_ANSWERS),
  },
};

const normalize = (value) => (value ?? '').trim().toLowerCase();

const pickNextVerse = () => {
  const pool =
    VERSES.length > 1
      ? VERSES.filter((entry) => entry.id !== state.previousVerseId)
      : VERSES;
  const choice = pool[Math.floor(Math.random() * pool.length)];
  state.previousVerseId = choice.id;
  return choice;
};

const updateScoreboard = () => {
  const { totalBlanks, correctAnswers, totalPlayed, streak } = state.stats;
  if (totalBlanks === 0) {
    dom.accuracy.textContent = '—';
  } else {
    const accuracyPct = Math.round((correctAnswers / totalBlanks) * 100);
    dom.accuracy.textContent = `${accuracyPct}%`;
  }
  dom.versesPlayed.textContent = totalPlayed.toString();
  dom.streak.textContent = streak.toString();
};

const saveStats = () => {
  saveNumber(STORAGE_KEYS.STREAK, state.stats.streak);
  saveNumber(STORAGE_KEYS.TOTAL_PLAYED, state.stats.totalPlayed);
  saveNumber(STORAGE_KEYS.TOTAL_BLANKS, state.stats.totalBlanks);
  saveNumber(STORAGE_KEYS.CORRECT_ANSWERS, state.stats.correctAnswers);
};

const setActionStates = () => {
  if (!state.verse) {
    dom.checkButton.disabled = true;
    dom.nextButton.disabled = true;
    return;
  }
  const allFilled = state.verse.blanks.every(
    (blank) => Boolean(state.selections[blank.id]),
  );
  dom.checkButton.disabled = state.revealed || !allFilled;
  dom.nextButton.disabled = !state.revealed;
};

const renderVerse = (verse) => {
  dom.verseReference.textContent = verse.reference;
  dom.verseMode.textContent = `Multiple choice • ${verse.blanks.length} blank${verse.blanks.length > 1 ? 's' : ''}`;
  const markup = verse.template
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }
      return `<span class="blank" data-blank-id="${part.blankId}">_____</span>`;
    })
    .join('');
  dom.verseBody.innerHTML = markup;
};

const createChoiceCard = (blank) => {
  const container = document.createElement('article');
  container.className = 'choice-card';
  container.dataset.blankId = blank.id;

  const label = document.createElement('span');
  label.className = 'choice-card__label';
  label.textContent = blank.label;

  const optionList = document.createElement('div');
  optionList.className = 'choice-options';

  blank.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-option';
    button.dataset.blankId = blank.id;
    button.dataset.choiceValue = option;
    button.textContent = option;
    optionList.appendChild(button);
  });

  container.append(label, optionList);
  return container;
};

const renderChoices = (verse) => {
  dom.choicesWrapper.innerHTML = '';
  verse.blanks.forEach((blank) => {
    const card = createChoiceCard(blank);
    dom.choicesWrapper.appendChild(card);
  });
};

const updateBlankFill = (blankId, value) => {
  const blankElement = dom.verseBody.querySelector(`[data-blank-id="${blankId}"]`);
  if (!blankElement) {
    return;
  }
  blankElement.textContent = value;
  blankElement.classList.toggle('blank--filled', Boolean(value));
};

const markSelectedOption = (blankId, value) => {
  const buttons = dom.choicesWrapper.querySelectorAll(
    `.choice-option[data-blank-id="${blankId}"]`,
  );
  buttons.forEach((button) => {
    const isSelected = button.dataset.choiceValue === value;
    button.classList.toggle('is-selected', isSelected);
  });
};

const handleChoiceSelection = (blankId, value) => {
  if (state.revealed) {
    return;
  }
  state.selections[blankId] = value;
  updateBlankFill(blankId, value);
  markSelectedOption(blankId, value);
  setActionStates();
};

const highlightResults = (verse) => {
  let verseCorrect = true;
  let correctCount = 0;
  verse.blanks.forEach((blank) => {
    const userInput = state.selections[blank.id];
    const isCorrect = normalize(userInput) === normalize(blank.answer);
    if (isCorrect) {
      correctCount += 1;
    } else {
      verseCorrect = false;
    }

    const blankElement = dom.verseBody.querySelector(
      `[data-blank-id="${blank.id}"]`,
    );
    if (blankElement) {
      blankElement.textContent = blank.answer;
      blankElement.classList.add('blank--filled');
      blankElement.dataset.correct = isCorrect ? 'true' : 'false';
    }

    const buttons = dom.choicesWrapper.querySelectorAll(
      `.choice-option[data-blank-id="${blank.id}"]`,
    );
    buttons.forEach((button) => {
      const isAnswer = normalize(button.dataset.choiceValue) === normalize(blank.answer);
      button.classList.toggle('is-correct', isAnswer);
      if (!isAnswer && button.dataset.choiceValue === userInput) {
        button.classList.add('is-incorrect');
      }
      button.disabled = true;
    });
  });

  state.stats.totalPlayed += 1;
  state.stats.totalBlanks += verse.blanks.length;
  state.stats.correctAnswers += correctCount;
  state.stats.streak = verseCorrect ? state.stats.streak + 1 : 0;
  saveStats();
  updateScoreboard();
  state.revealed = true;
  setActionStates();
};

const startNextVerse = () => {
  state.verse = pickNextVerse();
  state.selections = {};
  state.revealed = false;
  renderVerse(state.verse);
  renderChoices(state.verse);
  dom.choicesWrapper.querySelectorAll('.choice-option').forEach((button) => {
    button.disabled = false;
  });
  setActionStates();
};

dom.choicesWrapper.addEventListener('click', (event) => {
  const trigger = event.target.closest('.choice-option');
  if (!trigger) {
    return;
  }
  const blankId = trigger.dataset.blankId;
  const value = trigger.dataset.choiceValue;
  handleChoiceSelection(blankId, value);
});

dom.checkButton.addEventListener('click', () => {
  if (!state.verse || state.revealed) {
    return;
  }
  highlightResults(state.verse);
});

dom.nextButton.addEventListener('click', () => {
  if (!state.revealed) {
    return;
  }
  startNextVerse();
});

const init = () => {
  updateScoreboard();
  startNextVerse();
};

init();

window.scriptureFillIns = {
  BUILD_VERSION,
};
