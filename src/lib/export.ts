import type { Contraction } from './types.ts';
import { formatDuration, formatTime } from './utils.ts';

export function downloadCSV(contractions: Contraction[]): void {
  const sorted = [...contractions].sort((a, b) => a.startedAt - b.startedAt);

  const header = '#,Start Time,End Time,Duration (s),Interval from Prev (s),Note';
  const rows = sorted.map((c, i) => {
    const prev = sorted[i - 1];
    const durationS =
      c.endedAt !== null ? Math.round((c.endedAt - c.startedAt) / 1000).toString() : '';
    const intervalS =
      prev !== undefined ? Math.round((c.startedAt - prev.startedAt) / 1000).toString() : '';
    const startISO = new Date(c.startedAt).toISOString();
    const endISO = c.endedAt !== null ? new Date(c.endedAt).toISOString() : '';
    const note = (c.note ?? '').replace(/"/g, '""');
    return `${i + 1},"${startISO}","${endISO}",${durationS},${intervalS},"${note}"`;
  });

  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contractions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatAsText(contractions: Contraction[]): string {
  const sorted = [...contractions].sort((a, b) => a.startedAt - b.startedAt);
  const lines = ['Contraction Log', '==============='];

  sorted.forEach((c, i) => {
    const prev = sorted[i - 1];
    const duration =
      c.endedAt !== null ? `lasted ${formatDuration(c.endedAt - c.startedAt)}` : 'ongoing';
    const interval =
      prev !== undefined ? `, ${formatDuration(c.startedAt - prev.startedAt)} after prev` : '';
    lines.push(`${i + 1}. ${formatTime(c.startedAt)} — ${duration}${interval}`);
  });

  return lines.join('\n');
}

export async function shareContractions(contractions: Contraction[]): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Contraction Log',
        text: formatAsText(contractions),
      });
      return;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('[export] share failed, falling back to CSV', err);
      } else {
        return; // user cancelled
      }
    }
  }
  downloadCSV(contractions);
}
