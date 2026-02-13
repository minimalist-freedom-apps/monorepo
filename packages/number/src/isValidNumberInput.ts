import { stripCommas } from './stripCommas';

export const isValidNumberInput = (value: string): boolean => {
    const normalizedValue = value.trim();

    if (normalizedValue === '' || normalizedValue === '-' || normalizedValue.endsWith(',')) {
        return true;
    }

    return !Number.isNaN(Number(stripCommas(normalizedValue)));
};
