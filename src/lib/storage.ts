import type { Contraction, PersistedShape } from './types.ts';

const STORAGE_KEY = 'contraction-timer:v1';
const SCHEMA_VERSION = 1;

function isValidContraction(x: unknown): x is Contraction {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c['id'] === 'string' &&
    typeof c['startedAt'] === 'number' &&
    (c['endedAt'] === null || typeof c['endedAt'] === 'number') &&
    (c['note'] === undefined || typeof c['note'] === 'string')
  );
}

function migrate(data: PersistedShape): PersistedShape {
  // No migrations needed for v1 → v1
  if (typeof data.version !== 'number') {
    return { version: SCHEMA_VERSION, contractions: [] };
  }
  return data;
}

export function loadContractions(): Contraction[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedShape;
    if (!parsed || typeof parsed !== 'object') return [];
    const migrated = migrate(parsed);
    return (migrated.contractions ?? []).filter(isValidContraction);
  } catch (err) {
    console.error('[storage] corrupted data, backing up and resetting', err);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        localStorage.setItem(`${STORAGE_KEY}:corrupted:${Date.now()}`, raw);
      }
    } catch {
      // ignore backup failure
    }
    return [];
  }
}

export function saveContractions(contractions: Contraction[]): void {
  try {
    const shape: PersistedShape = {
      version: SCHEMA_VERSION,
      contractions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch (err) {
    console.error('[storage] write failed', err);
  }
}
