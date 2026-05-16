export type Contraction = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  note?: string;
};

export type AppPhase = 'idle' | 'active' | 'resting';

export type Stats = {
  count: number;
  windowCount: number;
  avgDurationMs: number | null;
  avgIntervalMs: number | null;
  is511: boolean;
  since511: number | null;
  firstContractionAt: number | null;
};

export type PersistedShape = {
  version: number;
  contractions: Contraction[];
};
