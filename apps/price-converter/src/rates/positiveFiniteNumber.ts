import { brand, FiniteNumber, positive } from '@evolu/common';

export const PositiveFiniteNumber = brand('PositiveFiniteNumber', positive(FiniteNumber));
export type PositiveFiniteNumber = typeof PositiveFiniteNumber.Output;

export const getPositiveFiniteReciprocal = (value: unknown): PositiveFiniteNumber | null => {
    const valueResult = PositiveFiniteNumber.fromUnknown(value);

    if (!valueResult.ok) {
        return null;
    }

    return PositiveFiniteNumber.orNull(1 / valueResult.value);
};
