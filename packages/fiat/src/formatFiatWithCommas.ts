import type { CurrencyCode } from '@evolu/common';
import type { FiatAmount } from './types';

export const formatFiatWithCommas = (
    value: FiatAmount<CurrencyCode> | undefined,
): string => {
    if (value === undefined) {
        return '0';
    }

    const str = value.toFixed(3);
    const [intPart, decPart] = str.split('.');

    // Add thousand separators to integer part
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Remove trailing zeros from decimal
    const formattedDec = decPart ? decPart.replace(/0+$/, '') : '';

    return formattedInt + (formattedDec ? `.${formattedDec}` : '');
};
