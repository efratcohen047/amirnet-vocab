import type { FlagMap, History, ProgressMap, Session, Settings } from './types';

// Every value is stored as { version, data } under amirnet:v1:<key> (research R6).
const PREFIX = 'amirnet:v1:';
const VERSION = 1;

interface Stored<T> {
  version: number;
  data: T;
}

/** Returns the stored value, or `fallback` if it is missing, unreadable or another version. */
export function load<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(PREFIX + key);
    if (text === null) return fallback;
    const stored = JSON.parse(text) as Stored<T>;
    return stored?.version === VERSION && stored.data !== undefined ? stored.data : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ version: VERSION, data: value }));
  } catch {
    // Storage full or blocked: nothing more we can do on the device.
  }
}

export const DEFAULT_SETTINGS: Settings = { newPerDay: 20 };

export const store = {
  loadProgress: () => load<ProgressMap>('progress', {}),
  saveProgress: (v: ProgressMap) => save('progress', v),
  loadSession: () => load<Session | null>('session', null),
  saveSession: (v: Session | null) => save('session', v),
  loadHistory: () => load<History>('history', {}),
  saveHistory: (v: History) => save('history', v),
  loadSettings: () => ({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>('settings', {}) }),
  saveSettings: (v: Settings) => save('settings', v),
  loadFlags: () => load<FlagMap>('flags', {}),
  saveFlags: (v: FlagMap) => save('flags', v),
};

/** Asks the browser not to evict our storage. Best effort; failures are ignored. */
export function requestPersistence(): void {
  navigator.storage?.persist?.().catch(() => {});
}
