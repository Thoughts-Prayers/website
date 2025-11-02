export const BUILD_VERSION = '20250305';

export const DIFFICULTIES = [
  {
    id: 'gentle',
    label: 'Gentle drizzle',
    rows: 4,
    cols: 4,
  },
  {
    id: 'steady',
    label: 'Steady rain',
    rows: 4,
    cols: 5,
  },
  {
    id: 'deluge',
    label: 'Flood watch',
    rows: 6,
    cols: 6,
  },
];

export const DEFAULT_DIFFICULTY = DIFFICULTIES[0].id;

export const STORAGE_KEYS = {
  DIFFICULTY: 'two-by-two:difficulty',
};

export const MISMATCH_DELAY_MS = 900;
