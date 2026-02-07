import { describe, expect, test } from 'vitest';
import { calculateCircle } from './calculateCircle';

describe(calculateCircle.name, () => {
    const testCases: Array<{
        readonly description: string;
        readonly amount: number;
        readonly originalDiameter: number;
        readonly newDiameter: number;
        readonly expected: number | null;
    }> = [
        {
            description: 'scales amount by ratio of squared diameters',
            amount: 100,
            originalDiameter: 20,
            newDiameter: 30,
            expected: 225,
        },
        {
            description: 'returns same amount for equal diameters',
            amount: 100,
            originalDiameter: 20,
            newDiameter: 20,
            expected: 100,
        },
        {
            description: 'returns null when original diameter is zero',
            amount: 100,
            originalDiameter: 0,
            newDiameter: 30,
            expected: null,
        },
        {
            description: 'scales down for smaller new diameter',
            amount: 100,
            originalDiameter: 30,
            newDiameter: 20,
            expected: 44.44,
        },
        {
            description: 'returns zero when new diameter is zero',
            amount: 100,
            originalDiameter: 20,
            newDiameter: 0,
            expected: 0,
        },
        {
            description: 'returns zero when amount is zero',
            amount: 0,
            originalDiameter: 20,
            newDiameter: 30,
            expected: 0,
        },
    ];

    test.each(testCases)('$description', ({
        amount,
        originalDiameter,
        newDiameter,
        expected,
    }) => {
        const result = calculateCircle(amount, originalDiameter, newDiameter);

        if (expected === null) {
            expect(result).toBeNull();
        } else {
            expect(result).toBeCloseTo(expected, 1);
        }
    });
});
