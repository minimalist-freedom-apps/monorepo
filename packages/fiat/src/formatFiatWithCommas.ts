import { formatNumberWithCommas } from '@minimalist-apps/number';
import type { CurrencyCode, FiatAmount } from './types';

export const formatFiatWithCommas = (value: FiatAmount<CurrencyCode> | undefined): string => {
    if (value === undefined) {
        return '0';
    }

    return formatNumberWithCommas({ value, precision: 3 });
};
