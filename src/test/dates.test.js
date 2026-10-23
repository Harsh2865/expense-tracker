import { describe, it, expect } from 'vitest';
import {
  getLocalDateString,
  getPreviousMonth,
  getNextMonth,
  isValidDate,
  isLeapYear,
  daysInMonth,
} from '../utils/dates.js';

describe('dates.js', () => {
  it('October 31 and November 1 belong to different months', () => {
    const d1 = '2026-10-31';
    const d2 = '2026-11-01';
    expect(d1.slice(0, 7)).toBe('2026-10');
    expect(d2.slice(0, 7)).toBe('2026-11');
    expect(d1.slice(0, 7)).not.toBe(d2.slice(0, 7));
  });

  it('accepts February 29 in a leap year', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(isValidDate('2024-02-29')).toBe(true);
  });

  it('rejects February 29 in a non-leap year', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(isValidDate('2025-02-29')).toBe(false);
  });

  it('rejects February 30 always', () => {
    expect(isValidDate('2024-02-30')).toBe(false);
    expect(isValidDate('2025-02-30')).toBe(false);
  });

  it('rejects invalid days in 30-day months (e.g., April 31)', () => {
    expect(isValidDate('2026-04-31')).toBe(false);
  });

  it('generates local date string accurately around IST midnight without UTC skew', () => {
    // 2026-10-23T01:30:00+05:30 in IST is 2026-10-22T20:00:00Z in UTC.
    // UTC date is Oct 22, but local IST date is Oct 23!
    const mockIstDate = new Date('2026-10-23T01:30:00+05:30');
    // Using local date string generator:
    const localDate = getLocalDateString(mockIstDate);
    expect(localDate).toBe('2026-10-23');
  });

  it('accepts future calendar dates within the valid range', () => {
    expect(isValidDate('2030-05-15')).toBe(true);
    expect(isValidDate('2099-12-31')).toBe(true);
  });

  it('rejects dates strictly outside 2000 to 2100', () => {
    expect(isValidDate('1999-12-31')).toBe(false);
    expect(isValidDate('2101-01-01')).toBe(false);
  });

  it('navigates previous and next months correctly across year boundaries', () => {
    expect(getPreviousMonth('2026-01')).toBe('2025-12');
    expect(getPreviousMonth('2026-10')).toBe('2026-09');
    expect(getNextMonth('2025-12')).toBe('2026-01');
    expect(getNextMonth('2026-10')).toBe('2026-11');
  });
});
