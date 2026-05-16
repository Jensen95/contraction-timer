import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeStats, check511 } from './stats.ts';
import type { Contraction } from './types.ts';

const NOW = 1_700_000_000_000;

function mkC(startedAt: number, durationMs: number, id?: string): Contraction {
  return {
    id: id ?? `c-${startedAt}`,
    startedAt,
    endedAt: startedAt + durationMs,
  };
}

function mkOpen(startedAt: number, id?: string): Contraction {
  return {
    id: id ?? `open-${startedAt}`,
    startedAt,
    endedAt: null,
  };
}

// Contractions at 5-min intervals, each 60s long, from 60 min ago to now
function make511Contractions(count = 13): Contraction[] {
  return Array.from({ length: count }, (_, i) =>
    mkC(NOW - 60 * 60 * 1000 + i * 5 * 60 * 1000, 60 * 1000),
  );
}

describe('computeStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it('returns empty stats for no contractions', () => {
    const s = computeStats([]);
    expect(s.count).toBe(0);
    expect(s.windowCount).toBe(0);
    expect(s.avgDurationMs).toBeNull();
    expect(s.avgIntervalMs).toBeNull();
    expect(s.is511).toBe(false);
    expect(s.firstContractionAt).toBeNull();
  });

  it('counts total and window contractions separately', () => {
    // 1 old contraction (outside window) + 2 recent ones
    const old = mkC(NOW - 2 * 60 * 60 * 1000, 60_000); // 2h ago
    const recent1 = mkC(NOW - 10 * 60 * 1000, 65_000); // 10 min ago
    const recent2 = mkC(NOW - 5 * 60 * 1000, 55_000); // 5 min ago
    const s = computeStats([old, recent1, recent2]);
    expect(s.count).toBe(3);
    expect(s.windowCount).toBe(2);
  });

  it('computes avgDurationMs correctly', () => {
    const cs = [mkC(NOW - 20 * 60_000, 60_000), mkC(NOW - 10 * 60_000, 80_000)];
    const s = computeStats(cs);
    expect(s.avgDurationMs).toBe(70_000);
  });

  it('excludes ongoing contractions from duration average', () => {
    const cs = [mkC(NOW - 20 * 60_000, 60_000), mkOpen(NOW - 5 * 60_000)];
    const s = computeStats(cs);
    // Only the completed one counts
    expect(s.avgDurationMs).toBe(60_000);
  });

  it('computes avgIntervalMs (start-to-start)', () => {
    const cs = [
      mkC(NOW - 15 * 60_000, 60_000),
      mkC(NOW - 10 * 60_000, 60_000), // 5 min after prev
      mkC(NOW - 5 * 60_000, 60_000), // 5 min after prev
    ];
    const s = computeStats(cs);
    expect(s.avgIntervalMs).toBe(5 * 60_000);
  });

  it('returns null avgIntervalMs when only one contraction', () => {
    const s = computeStats([mkC(NOW - 5 * 60_000, 60_000)]);
    expect(s.avgIntervalMs).toBeNull();
  });

  it('records firstContractionAt', () => {
    const cs = [mkC(NOW - 30 * 60_000, 60_000), mkC(NOW - 10 * 60_000, 60_000)];
    expect(computeStats(cs).firstContractionAt).toBe(NOW - 30 * 60_000);
  });
});

describe('check511', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  it('returns false for empty array', () => {
    expect(check511([]).met).toBe(false);
  });

  it('returns false for fewer than 4 contractions', () => {
    const cs = Array.from({ length: 3 }, (_, i) => mkC(NOW - (3 - i) * 5 * 60_000, 60_000));
    expect(check511(cs).met).toBe(false);
  });

  it('returns true for perfect 5-1-1 conditions', () => {
    const cs = make511Contractions(13);
    const r = check511(cs);
    expect(r.met).toBe(true);
    expect(r.since).not.toBeNull();
  });

  it('returns false when intervals are too long (>5 min avg)', () => {
    const cs = Array.from({ length: 13 }, (_, i) =>
      mkC(NOW - 60 * 60_000 + i * 8 * 60_000, 60_000),
    );
    expect(check511(cs).met).toBe(false);
  });

  it('returns false when durations are too short (<60s avg)', () => {
    const cs = Array.from({ length: 13 }, (_, i) =>
      mkC(NOW - 60 * 60_000 + i * 5 * 60_000, 30_000),
    );
    expect(check511(cs).met).toBe(false);
  });

  it('returns false when fewer than 4 contractions in last 60 min', () => {
    // Only 3 contractions inside the window
    const cs = Array.from({ length: 3 }, (_, i) => mkC(NOW - 15 * 60_000 + i * 5 * 60_000, 60_000));
    expect(check511(cs).met).toBe(false);
  });

  it('returns false when >=4 contractions exist but <4 within the last hour', () => {
    // 4 old contractions outside the window, 2 recent ones inside
    const old = Array.from({ length: 4 }, (_, i) =>
      mkC(NOW - 3 * 60 * 60_000 + i * 5 * 60_000, 60_000),
    );
    const recent = Array.from({ length: 2 }, (_, i) =>
      mkC(NOW - 10 * 60_000 + i * 5 * 60_000, 60_000),
    );
    expect(check511([...old, ...recent]).met).toBe(false);
  });

  it('sets since to the first contraction in qualifying window', () => {
    const cs = make511Contractions(13);
    const r = check511(cs);
    if (r.met) {
      expect(r.since).toBe(cs[0]!.startedAt);
    }
  });
});
