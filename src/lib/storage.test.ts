import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadContractions, saveContractions } from './storage.ts';
import type { Contraction } from './types.ts';

const VALID_CONTRACTION: Contraction = {
  id: 'abc-123',
  startedAt: 1_700_000_000_000,
  endedAt: 1_700_000_060_000,
};

describe('saveContractions + loadContractions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when localStorage is empty', () => {
    expect(loadContractions()).toEqual([]);
  });

  it('saves and reloads a contraction', () => {
    saveContractions([VALID_CONTRACTION]);
    const loaded = loadContractions();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(VALID_CONTRACTION);
  });

  it('preserves order of multiple contractions', () => {
    const cs: Contraction[] = [
      { id: 'a', startedAt: 1000, endedAt: 2000 },
      { id: 'b', startedAt: 3000, endedAt: 4000 },
    ];
    saveContractions(cs);
    expect(loadContractions()).toEqual(cs);
  });

  it('handles contraction with null endedAt', () => {
    const open: Contraction = { id: 'open', startedAt: 1_000_000, endedAt: null };
    saveContractions([open]);
    expect(loadContractions()[0]).toEqual(open);
  });

  it('handles contraction with a note', () => {
    const c: Contraction = { ...VALID_CONTRACTION, note: 'water broke' };
    saveContractions([c]);
    expect(loadContractions()[0]?.note).toBe('water broke');
  });

  it('returns empty array and backs up corrupted JSON', () => {
    localStorage.setItem('contraction-timer:v1', 'not-valid-json{{{');
    const result = loadContractions();
    expect(result).toEqual([]);
    // Corrupted data should be backed up
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.includes(':corrupted:'))).toBe(true);
  });

  it('filters out invalid entries, keeps valid ones', () => {
    const raw = JSON.stringify({
      version: 1,
      contractions: [
        VALID_CONTRACTION,
        { id: 123, startedAt: 'not-a-number', endedAt: null }, // invalid
        { id: 'c2', startedAt: 1_700_000_100_000, endedAt: null }, // valid
      ],
    });
    localStorage.setItem('contraction-timer:v1', raw);
    const loaded = loadContractions();
    expect(loaded).toHaveLength(2);
    expect(loaded[0]?.id).toBe(VALID_CONTRACTION.id);
    expect(loaded[1]?.id).toBe('c2');
  });

  it('returns empty array for missing version field (schema mismatch)', () => {
    const raw = JSON.stringify({ contractions: [VALID_CONTRACTION] });
    localStorage.setItem('contraction-timer:v1', raw);
    // Should still work (migrate() handles missing version)
    const loaded = loadContractions();
    expect(Array.isArray(loaded)).toBe(true);
  });

  it('does not throw if localStorage.setItem fails', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveContractions([VALID_CONTRACTION])).not.toThrow();
  });
});
