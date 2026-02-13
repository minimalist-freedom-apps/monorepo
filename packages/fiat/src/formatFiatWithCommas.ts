import type { CurrencyCode } from '@evolu/common';
import { formatNumberWithCommas } from '@minimalist-apps/number';
import type { FiatAmount } from './types';

export const formatFiatWithCommas = (value: FiatAmount<CurrencyCode> | undefined): string => {
    if (value === undefined) {
        return '0';
    }

    return formatNumberWithCommas({ value, precision: 3 });
};
