import type { Contraction, Stats } from './types.ts';

export function computeStats(contractions: Contraction[], windowMs = 60 * 60 * 1000): Stats {
  const now = Date.now();
  const count = contractions.length;
  // v8 ignore next -- contractions[0] is always defined when count > 0
  const firstContractionAt = count > 0 ? (contractions[0]?.startedAt ?? null) : null;

  const completed = contractions.filter((c) => c.endedAt !== null);
  const windowStart = now - windowMs;
  const windowCompleted = completed.filter((c) => c.startedAt >= windowStart);
  const windowCount = windowCompleted.length;

  const avgDurationMs =
    windowCompleted.length > 0
      ? windowCompleted.reduce((sum, c) => sum + (c.endedAt! - c.startedAt), 0) /
        windowCompleted.length
      : null;

  // Start-to-start intervals — use all contractions sorted by time
  const sorted = [...contractions].sort((a, b) => a.startedAt - b.startedAt);
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i]!.startedAt - sorted[i - 1]!.startedAt);
  }
  // Take intervals corresponding to the window
  const windowIntervals = intervals.slice(-Math.max(0, windowCompleted.length - 1));
  const avgIntervalMs =
    windowIntervals.length > 0
      ? windowIntervals.reduce((a, b) => a + b, 0) / windowIntervals.length
      : null;

  const fiveOneOne = check511(contractions);

  return {
    count,
    windowCount,
    avgDurationMs,
    avgIntervalMs,
    is511: fiveOneOne.met,
    since511: fiveOneOne.since,
    firstContractionAt,
  };
}

export function check511(contractions: Contraction[]): { met: boolean; since: number | null } {
  const completed = contractions.filter((c) => c.endedAt !== null);
  if (completed.length < 4) return { met: false, since: null };

  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const window = completed.filter((c) => c.startedAt >= windowStart);
  if (window.length < 4) return { met: false, since: null };

  const sorted = [...window].sort((a, b) => a.startedAt - b.startedAt);

  const durations = sorted.map((c) => c.endedAt! - c.startedAt);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i]!.startedAt - sorted[i - 1]!.startedAt);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  const met = avgInterval <= 5 * 60 * 1000 && avgDuration >= 60 * 1000;

  return {
    met,
    // v8 ignore next -- sorted[0] is always defined when met is true (requires >=4 items)
    since: met ? (sorted[0]?.startedAt ?? null) : null,
  };
}
