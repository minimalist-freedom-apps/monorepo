interface CalculateNewAmountByRectangleArgs {
    readonly amount: number;
    readonly originalA: number;
    readonly originalB: number;
    readonly newA: number;
    readonly newB: number;
}

export const calculateRectangle = ({
    amount,
    originalA,
    originalB,
    newA,
    newB,
}: CalculateNewAmountByRectangleArgs): number | null => {
    const originalArea = originalA * originalB;

    if (originalArea === 0) {
        return null;
    }

    return (amount * (newA * newB)) / originalArea;
};
