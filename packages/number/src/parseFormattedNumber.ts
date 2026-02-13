import { stripCommas } from './stripCommas';

export const parseFormattedNumber = (value: string): number => {
    if (!value) {
        return 0;
    }

    return Number.parseFloat(stripCommas(value));
};
