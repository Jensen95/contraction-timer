import type en from './locales/en.ts';
export type Messages = Record<keyof typeof en, string>;
export type MessageKey = keyof typeof en;
