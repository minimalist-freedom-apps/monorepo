interface CalculateCircleProps {
    readonly amount: number;
    readonly originalDiameter: number;
    readonly newDiameter: number;
}

export const calculateCircle = ({
    amount,
    originalDiameter,
    newDiameter,
}: CalculateCircleProps): number | null => {
    if (originalDiameter === 0) {
        return null;
    }

    return (amount * newDiameter ** 2) / originalDiameter ** 2;
};
