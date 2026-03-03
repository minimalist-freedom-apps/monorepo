import { describe, expect, test } from 'vitest';
import { calculateRectangle } from './calculateRectangle';

describe(calculateRectangle.name, () => {
    const testCases: Array<{
        readonly description: string;
        readonly amount: number;
        readonly originalA: number;
        readonly originalB: number;
        readonly newA: number;
        readonly newB: number;
        readonly expected: number | null;
    }> = [
        {
            description: 'scales amount by ratio of rectangle areas',
            amount: 100,
            originalA: 20,
            originalB: 30,
            newA: 40,
            newB: 60,
            expected: 400,
        },
        {
            description: 'returns same amount for equal dimensions',
            amount: 100,
            originalA: 20,
            originalB: 30,
            newA: 20,
            newB: 30,
            expected: 100,
        },
        {
            description: 'returns null when original area is zero (a = 0)',
            amount: 100,
            originalA: 0,
            originalB: 30,
            newA: 40,
            newB: 60,
            expected: null,
        },
        {
            description: 'returns null when original area is zero (b = 0)',
            amount: 100,
            originalA: 20,
            originalB: 0,
            newA: 40,
            newB: 60,
            expected: null,
        },
        {
            description: 'scales down for smaller new dimensions',
            amount: 100,
            originalA: 40,
            originalB: 60,
            newA: 20,
            newB: 30,
            expected: 25,
        },
        {
            description: 'returns zero when new area is zero',
            amount: 100,
            originalA: 20,
            originalB: 30,
            newA: 0,
            newB: 60,
            expected: 0,
        },
        {
            description: 'returns zero when amount is zero',
            amount: 0,
            originalA: 20,
            originalB: 30,
            newA: 40,
            newB: 60,
            expected: 0,
        },
    ];

    test.each(testCases)('$description', ({
        amount,
        originalA,
        originalB,
        newA,
        newB,
        expected,
    }) => {
        const result = calculateRectangle({
            amount,
            originalA,
            originalB,
            newA,
            newB,
        });

        if (expected === null) {
            expect(result).toBeNull();
        } else {
            expect(result).toBeCloseTo(expected, 1);
        }
    });
});
