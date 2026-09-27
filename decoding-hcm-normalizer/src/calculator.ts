export type Shift = {
  id: string;
  dateLabel: string;
  shiftLabel: string;
  tq: number;
  sq: number;
  easy?: boolean;
};

export type Result = Shift & {
  method1: number;
  method2: number;
};

export const DEFAULT_SHIFTS: Shift[] = [
  { id: '2026-09-02-1', dateLabel: '2 Sep', shiftLabel: '1st Shift', tq: 94.33, sq: 67.92},
  { id: '2026-09-02-2', dateLabel: '2 Sep', shiftLabel: '2nd Shift', tq: 92.6, sq: 68.08 },
  { id: '2026-09-02-3', dateLabel: '2 Sep', shiftLabel: '3rd Shift', tq: 96.4, sq: 69.11 },
  { id: '2026-09-03-1', dateLabel: '3 Sep', shiftLabel: '1st Shift', tq: 95.38, sq: 66.42 },
  { id: '2026-09-18-1', dateLabel: '18 Sep', shiftLabel: '1st Shift', tq: 96.5, sq: 72.1, easy: true },
  { id: '2026-09-18-2', dateLabel: '18 Sep', shiftLabel: '2nd Shift', tq: 94.5, sq: 68.06 }
];

export const CONSTANTS = {
  multiplier: 28.53,
  base: 68
};

/**
 * Method 1 from the supplied handwritten formula:
 * A = [12.96 / (Tq - Sq)] * (B - Sq) + 76.54
 */
export function normalize(raw: number, shift: Shift): number {
  const denominator = shift.tq - shift.sq;
  if (!Number.isFinite(raw) || denominator === 0) return NaN;
  return (CONSTANTS.multiplier / denominator) * (raw - shift.sq) + CONSTANTS.base;
}

/**
 * Method 2 interpretation of the supplied note:
 * 1) Calculate Method 1 for all shifts.
 * 2) Use the 2 Sep 3rd Shift as the reference/easy shift.
 * 3) Calculate its shortfall/excess against the raw mark: correction = B - easyMethod1.
 * 4) Add the same correction to every Method 1 result.
 *
 * Therefore Method 2 makes the easy/reference shift exactly equal to the raw mark.
 */
export function calculate(raw: number, shifts = DEFAULT_SHIFTS): Result[] {
  const method1 = shifts.map((shift) => normalize(raw, shift));
  const easyIndex = Math.max(0, shifts.findIndex((s) => s.easy));
  const correction = raw - method1[easyIndex];

  return shifts.map((shift, index) => ({
    ...shift,
    method1: method1[index],
    method2: method1[index] + correction
  }));
}

export function formatMarks(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(2);
}
