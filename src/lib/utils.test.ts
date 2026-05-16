import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatTime,
  formatIntervalMins,
  msToDatetimeLocal,
  datetimeLocalToMs,
} from './utils.ts';

describe('formatDuration', () => {
  it('formats zero as 0:00', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats 30 seconds as 0:30', () => {
    expect(formatDuration(30_000)).toBe('0:30');
  });

  it('formats 1 minute as 1:00', () => {
    expect(formatDuration(60_000)).toBe('1:00');
  });

  it('formats 1 min 2 sec as 1:02', () => {
    expect(formatDuration(62_000)).toBe('1:02');
  });

  it('pads seconds with leading zero', () => {
    expect(formatDuration(9_000)).toBe('0:09');
  });

  it('handles large values (10+ minutes)', () => {
    expect(formatDuration(10 * 60 * 1000 + 5_000)).toBe('10:05');
  });

  it('handles negative values gracefully (uses abs)', () => {
    expect(formatDuration(-30_000)).toBe('0:30');
  });
});

describe('formatTime', () => {
  it('returns a non-empty string', () => {
    expect(formatTime(Date.now())).not.toBe('');
  });

  it('returns a string with a colon separator', () => {
    expect(formatTime(Date.now())).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatIntervalMins', () => {
  it('formats exact minutes (no seconds) as "Nm"', () => {
    expect(formatIntervalMins(5 * 60 * 1000)).toBe('5m');
  });

  it('formats minutes and seconds as "Nm Xs"', () => {
    expect(formatIntervalMins(5 * 60 * 1000 + 30 * 1000)).toBe('5m 30s');
  });

  it('formats zero as "0m"', () => {
    expect(formatIntervalMins(0)).toBe('0m');
  });

  it('formats sub-minute interval as "0m Xs"', () => {
    expect(formatIntervalMins(45 * 1000)).toBe('0m 45s');
  });
});

describe('msToDatetimeLocal / datetimeLocalToMs', () => {
  it('round-trips through datetime-local format', () => {
    // Use a known time with zero seconds to avoid sub-minute truncation issues
    const d = new Date(2024, 0, 15, 14, 23, 0, 0); // Jan 15 2024, 14:23 local
    const ms = d.getTime();
    const s = msToDatetimeLocal(ms);
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    // Round-trip should be within 60s (datetime-local drops seconds)
    expect(Math.abs(datetimeLocalToMs(s) - ms)).toBeLessThan(60_000);
  });

  it('produces format YYYY-MM-DDTHH:MM', () => {
    const ms = new Date(2024, 5, 1, 9, 5, 0).getTime(); // June 1, 09:05
    const s = msToDatetimeLocal(ms);
    expect(s).toMatch(/^2024-06-01T09:05$/);
  });
});
