export const BUILD_VERSION = '20251116';

const VERSES_URL = new URL('./verses.json', import.meta.url);

export async function loadVerses() {
  const response = await fetch(VERSES_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load verses (status ${response.status})`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid verse data');
  }
  return data;
}

export const STORAGE_KEYS = {
  STREAK: 'scripture-fill-ins:streak',
  TOTAL_PLAYED: 'scripture-fill-ins:total-played',
  CORRECT_ANSWERS: 'scripture-fill-ins:correct-answers',
  TOTAL_BLANKS: 'scripture-fill-ins:total-blanks',
};
