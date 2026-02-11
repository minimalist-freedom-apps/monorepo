export const isValidNumberInput = (value: string): boolean => {
    const normalizedValue = value.trim();

    if (normalizedValue === '' || normalizedValue === '-' || normalizedValue.endsWith(',')) {
        return true;
    }

    const normalizedValue2 = normalizedValue.replace(/,/g, '');

    return !Number.isNaN(Number(normalizedValue2));
};
