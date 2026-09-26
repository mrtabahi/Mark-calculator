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
 * METHOD 1
 *
 * Formula:
 *
 * A = 12.96 × (B - Sq) / (Tq - Sq) + 76.54
 *
 * B  = Raw Marks
 * Tq = Tq value of the shift
 * Sq = Sq value of the shift
 *
 * IMPORTANT:
 * Normal subtraction is used.
 * Math.abs() is NOT used.
 */
export function normalize(raw: number, shift: Shift): number {
  const denominator = shift.tq - shift.sq;
  const numerator = raw - shift.sq;

  if (
    !Number.isFinite(raw) ||
    !Number.isFinite(shift.tq) ||
    !Number.isFinite(shift.sq) ||
    denominator === 0
  ) {
    return NaN;
  }

  return (
    CONSTANTS.multiplier *
      (numerator / denominator) +
    CONSTANTS.base
  );
}

/**
 * METHOD 2
 *
 * Easy/Reference Shift:
 * 2 Sep - 3rd Shift
 *
 * Step 1:
 * Calculate Method 1 for every shift.
 *
 * Step 2:
 * Calculate how many marks the Easy Shift
 * falls short of the original Raw Marks.
 *
 * correction = Raw Marks - Easy Shift Method 1
 *
 * Step 3:
 * Add this same correction to every
 * Method 1 result.
 */
export function calculate(
  raw: number,
  shifts = DEFAULT_SHIFTS
): Result[] {
  const method1 = shifts.map((shift) =>
    normalize(raw, shift)
  );

  const easyIndex = shifts.findIndex(
    (shift) => shift.easy === true
  );

  if (easyIndex === -1) {
    return shifts.map((shift, index) => ({
      ...shift,
      method1: method1[index],
      method2: method1[index]
    }));
  }

  const easyMethod1 = method1[easyIndex];

  // Easy shift me raw score se jitna difference hai,
  // wahi amount sabhi Method 1 results me add hoga.
  const correction = raw - easyMethod1;

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
