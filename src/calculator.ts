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
  {
    id: '2026-09-02-1',
    dateLabel: '2 Sep',
    shiftLabel: '1st Shift',
    tq: 89.35,
    sq: 78.95
  },
  {
    id: '2026-09-02-2',
    dateLabel: '2 Sep',
    shiftLabel: '2nd Shift',
    tq: 86,
    sq: 76.54
  },
  {
    id: '2026-09-02-3',
    dateLabel: '2 Sep',
    shiftLabel: '3rd Shift',
    tq: 91.6,
    sq: 80.87,
    easy: true
  },
  {
    id: '2026-09-03-1',
    dateLabel: '3 Sep',
    shiftLabel: '1st Shift',
    tq: 89.4,
    sq: 78.85
  },
  {
    id: '2026-09-18-1',
    dateLabel: '18 Sep',
    shiftLabel: '1st Shift',
    tq: 91.6,
    sq: 77.55
  },
  {
    id: '2026-09-18-2',
    dateLabel: '18 Sep',
    shiftLabel: '2nd Shift',
    tq: 89,
    sq: 80.68
  }
];

export const CONSTANTS = {
  multiplier: 12.96,
  base: 76.54
};

/**
 * Method 1
 *
 * Formula:
 *
 * A = [12.96 / |Tq - Sq|] × |B - Sq| + 76.54
 *
 * सभी differences को absolute रखा गया है,
 * इसलिए कोई negative difference नहीं आएगा.
 */
export function normalize(raw: number, shift: Shift): number {
  // Tq और Sq का केवल difference
  const denominator = Math.abs(shift.tq - shift.sq);

  if (
    !Number.isFinite(raw) ||
    !Number.isFinite(shift.tq) ||
    !Number.isFinite(shift.sq) ||
    denominator === 0
  ) {
    return NaN;
  }

  // Raw marks और Sq का केवल difference
  const rawDifference = Math.abs(raw - shift.sq);

  return (
    (CONSTANTS.multiplier / denominator) * rawDifference +
    CONSTANTS.base
  );
}

/**
 * Method 2
 *
 * 1. पहले सभी shifts का Method 1 calculate होगा.
 * 2. Easy/Reference shift चुनी जाएगी.
 * 3. Raw और Easy Shift के Method 1 result का
 *    केवल absolute difference लिया जाएगा.
 * 4. वही positive correction सभी shifts में add होगा.
 *
 * correction = |Raw - Easy Method 1|
 *
 * Method 2 = Method 1 + correction
 */
export function calculate(
  raw: number,
  shifts = DEFAULT_SHIFTS
): Result[] {
  const method1 = shifts.map((shift) => normalize(raw, shift));

  const easyIndex = Math.max(
    0,
    shifts.findIndex((s) => s.easy)
  );

  const easyMethod1 = method1[easyIndex];

  // केवल difference, negative value नहीं
  const correction = Math.abs(raw - easyMethod1);

  return shifts.map((shift, index) => ({
    ...shift,
    method1: method1[index],
    method2: method1[index] + correction
  }));
}

export function formatMarks(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return value.toFixed(2);
}
