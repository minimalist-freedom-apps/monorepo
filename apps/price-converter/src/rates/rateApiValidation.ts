export type UnknownRecord = Readonly<Record<string, unknown>>;

export const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const isPositiveFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

export const getPositiveFiniteReciprocal = (value: unknown): number | null => {
    if (!isPositiveFiniteNumber(value)) {
        return null;
    }

    const reciprocal = 1 / value;

    return isPositiveFiniteNumber(reciprocal) ? reciprocal : null;
};
