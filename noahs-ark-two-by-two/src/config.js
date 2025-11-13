export const BUILD_VERSION = '20251112';

export const DIFFICULTIES = [
  {
    id: 'gentle',
    label: 'Easy',
    rows: 4,
    cols: 4,
  },
  {
    id: 'steady',
    label: 'Standard',
    rows: 4,
    cols: 5,
  },
  {
    id: 'deluge',
    label: 'Expert',
    rows: 6,
    cols: 6,
  },
];

export const DEFAULT_DIFFICULTY = DIFFICULTIES[0].id;

export const STORAGE_KEYS = {
  DIFFICULTY: 'two-by-two:difficulty',
};

export const MISMATCH_DELAY_MS = 900;
