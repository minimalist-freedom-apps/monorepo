import { addThousandSeparators } from '@minimalist-apps/number';
import { groupBtcDecimalDigits } from './groupBtcDecimalDigits';
import type { AmountBtc } from './types';

/**
 * Format number with custom grouping (e.g., 0.00,001,000)
 */
export const formatBtcToSatcommaNotation = (value: AmountBtc): string => {
    if (value === 0 || Math.abs(value) < 1e-8) {
        return '0';
    }

    const str = value.toFixed(8);
    const [intPart, decPart] = str.split('.');
    const intPartWithCommas = addThousandSeparators(intPart);

    if (!decPart) {
        return intPartWithCommas;
    }

    const grouped = groupBtcDecimalDigits(decPart);

    return intPartWithCommas + (grouped ? `.${grouped}` : '');
};
