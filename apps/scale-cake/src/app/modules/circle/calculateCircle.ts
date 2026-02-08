export const calculateCircle = (
    amount: number,
    originalDiameter: number,
    newDiameter: number,
): number | null => {
    if (originalDiameter === 0) {
        return null;
    }

    return (amount * newDiameter ** 2) / originalDiameter ** 2;
};
