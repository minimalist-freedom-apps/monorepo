import type { FractionalIndex } from './FractionalIndex';

/**
 * Compare two fractional indexes for sorting.
 *
 * Uses native string comparison — NOT `localeCompare` which is case-insensitive
 * and would produce incorrect ordering for fractional index keys.
 */
export const compareFractionalIndex = (a: FractionalIndex, b: FractionalIndex): number => {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
};
