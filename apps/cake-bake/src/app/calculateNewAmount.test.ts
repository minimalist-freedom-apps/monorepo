import { describe, expect, it } from 'vitest';
import { calculateNewAmount } from './calculateNewAmount';

describe('calculateNewAmount', () => {
    it('scales amount by ratio of squared diameters', () => {
        expect(calculateNewAmount(100, 20, 30)).toBeCloseTo(225);
    });

    it('returns same amount for equal diameters', () => {
        expect(calculateNewAmount(100, 20, 20)).toBe(100);
    });

    it('returns null when original diameter is zero', () => {
        expect(calculateNewAmount(100, 0, 30)).toBeNull();
    });

    it('scales down for smaller new diameter', () => {
        expect(calculateNewAmount(100, 30, 20)).toBeCloseTo(44.44, 1);
    });

    it('returns zero when new diameter is zero', () => {
        expect(calculateNewAmount(100, 20, 0)).toBe(0);
    });

    it('returns zero when amount is zero', () => {
        expect(calculateNewAmount(0, 20, 30)).toBe(0);
    });
});
