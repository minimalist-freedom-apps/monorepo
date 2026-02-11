export const isValidNumberInput = (value: string): boolean => {
    if (value === '') {
        return true;
    }

    return /^-?[\d,]*\.?[\d]*$/.test(value);
};
