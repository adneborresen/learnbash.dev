// The learner's progress, kept in the browser (localStorage). There are no
// accounts: progress lives on this device only. If storage is unavailable
// (private mode, blocked site data) everything still works for this visit.

export interface ProgressData {
  /** Challenge id → when it was first solved (ISO date). */
  solved: Record<string, string>;
  /** Challenge id → how many hints the learner has opened. */
  hints: Record<string, number>;
}

export const STORAGE_KEY = "learnbash:progress:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecordOf<T>(value: unknown, check: (v: unknown) => v is T): value is Record<string, T> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.values(value).every(check);
}

const isString = (v: unknown): v is string => typeof v === "string";
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

function parse(raw: string | null): ProgressData {
  const empty: ProgressData = { solved: {}, hints: {} };
  if (!raw) return empty;
  try {
    const data = JSON.parse(raw) as Partial<ProgressData>;
    return {
      solved: isRecordOf(data.solved, isString) ? data.solved : {},
      hints: isRecordOf(data.hints, isCount) ? data.hints : {},
    };
  } catch {
    return empty;
  }
}

export class ProgressStore {
  private storage?: StorageLike;
  private data: ProgressData;

  constructor(storage: StorageLike | undefined = defaultStorage()) {
    this.storage = storage;
    let raw: string | null = null;
    try {
      raw = storage?.getItem(STORAGE_KEY) ?? null;
    } catch {
      // Unreadable storage: start empty.
    }
    this.data = parse(raw);
  }

  isSolved(id: string): boolean {
    return id in this.data.solved;
  }

  solvedCount(ids: string[]): number {
    return ids.filter((id) => this.isSolved(id)).length;
  }

  markSolved(id: string, when = new Date()): void {
    if (this.isSolved(id)) return;
    this.data.solved[id] = when.toISOString();
    this.save();
  }

  hintsShown(id: string): number {
    return this.data.hints[id] ?? 0;
  }

  setHintsShown(id: string, count: number): void {
    if (count <= this.hintsShown(id)) return;
    this.data.hints[id] = count;
    this.save();
  }

  private save(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Full or blocked storage: keep progress in memory for this visit.
    }
  }
}
