import type { Contraction, AppPhase, Stats } from './types.ts';
import { loadContractions, saveContractions } from './storage.ts';
import { computeStats } from './stats.ts';

// Module-level debounce guard (not reactive)
let lastTapAt = 0;
const DEBOUNCE_MS = 500;

function canTap(): boolean {
  const now = Date.now();
  if (now - lastTapAt < DEBOUNCE_MS) return false;
  lastTapAt = now;
  return true;
}

class ContractionStore {
  contractions = $state<Contraction[]>(loadContractions());

  get lastContraction(): Contraction | null {
    return this.contractions.at(-1) ?? null;
  }

  get phase(): AppPhase {
    const last = this.lastContraction;
    if (last === null) return 'idle';
    return last.endedAt === null ? 'active' : 'resting';
  }

  get stats(): Stats {
    return computeStats(this.contractions);
  }

  startContraction(): void {
    if (!canTap()) return;
    const c: Contraction = {
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      endedAt: null,
    };
    this.contractions = [...this.contractions, c];
    saveContractions(this.contractions);
    navigator.vibrate?.(50);
  }

  endContraction(): void {
    if (!canTap() || this.phase !== 'active') return;
    const id = this.lastContraction!.id;
    const endedAt = Date.now();
    this.contractions = this.contractions.map((c) => (c.id === id ? { ...c, endedAt } : c));
    saveContractions(this.contractions);
    navigator.vibrate?.(50);
  }

  undo(): void {
    if (this.contractions.length === 0) return;
    const last = this.contractions.at(-1)!;
    if (last.endedAt !== null) {
      this.contractions = this.contractions.map((c) =>
        c.id === last.id ? { ...c, endedAt: null } : c,
      );
    } else {
      this.contractions = this.contractions.slice(0, -1);
    }
    saveContractions(this.contractions);
  }

  updateContraction(id: string, patch: Partial<Omit<Contraction, 'id'>>): void {
    this.contractions = this.contractions.map((c) => (c.id === id ? { ...c, ...patch } : c));
    saveContractions(this.contractions);
  }

  removeContraction(id: string): void {
    this.contractions = this.contractions.filter((c) => c.id !== id);
    saveContractions(this.contractions);
  }

  clearSession(): void {
    this.contractions = [];
    saveContractions(this.contractions);
  }
}

export const store = new ContractionStore();
