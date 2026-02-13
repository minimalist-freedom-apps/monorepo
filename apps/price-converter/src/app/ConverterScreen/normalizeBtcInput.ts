import { addThousandSeparators, stripCommas } from '@minimalist-apps/number';
import { groupBtcDecimalDigits } from '../../../../../packages/bitcoin/src/groupBtcDecimalDigits';

interface NormalizeBtcInputResult {
    readonly display: string;
    readonly numeric: string;
}

const limitBtcDecimalDigits = (decimals: string): string => {
    let result = decimals;

    while (result.length > 8) {
        const duplicateIndex = result.search(/(\d)\1/u);

        if (duplicateIndex >= 0) {
            result = result.slice(0, duplicateIndex + 1) + result.slice(duplicateIndex + 2);
        } else {
            result = result.slice(0, -1);
        }
    }

    return result;
};

const formatGroupedBtcInputDecimal = (decimals: string): string => {
    const grouped = groupBtcDecimalDigits(decimals.padEnd(8, '0'));

    return grouped
        .replace(/(?:,000)+$/u, '')
        .replace(/0+$/u, '')
        .replace(/,+$/u, '');
};

export const normalizeBtcInput = (value: string): NormalizeBtcInputResult => {
    const normalized = stripCommas(value.trim());
    const isNegative = normalized.startsWith('-');
    const unsigned = isNegative ? normalized.slice(1) : normalized;
    const [rawIntPart, rawDecimalPart] = unsigned.split('.');
    const intPart = rawIntPart.replace(/^0+(?=\d)/u, '');
    const sign = isNegative ? '-' : '';
    const intPartWithCommas = addThousandSeparators(intPart);

    if (!rawDecimalPart) {
        return {
            display: `${sign}${intPartWithCommas}`,
            numeric: `${sign}${intPart}`,
        };
    }

    const limitedDecimalPart = limitBtcDecimalDigits(rawDecimalPart);
    const groupedDecimalPart = formatGroupedBtcInputDecimal(limitedDecimalPart);

    return {
        display:
            groupedDecimalPart === ''
                ? `${sign}${intPartWithCommas}`
                : `${sign}${intPartWithCommas}.${groupedDecimalPart}`,
        numeric:
            limitedDecimalPart === ''
                ? `${sign}${intPart}`
                : `${sign}${intPart}.${limitedDecimalPart}`,
    };
};
