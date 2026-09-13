import { describe, expect, test } from 'vitest';
import { parseServerDate } from './dates';

describe('parseServerDate', () => {
  test('treats SQLite timestamps without an offset as UTC', () => {
    expect(parseServerDate('2026-09-13 12:34:56').toISOString())
      .toBe('2026-09-13T12:34:56.000Z');
  });

  test('preserves an explicit timezone offset', () => {
    expect(parseServerDate('2026-09-13T12:34:56-04:00').toISOString())
      .toBe('2026-09-13T16:34:56.000Z');
  });
});
