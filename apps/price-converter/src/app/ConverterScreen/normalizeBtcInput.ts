import { addThousandSeparators, stripCommas } from '@minimalist-apps/number';
import { groupBtcDecimalDigits } from '../../../../../packages/bitcoin/src/groupBtcDecimalDigits';

interface NormalizeBtcInputResult {
    readonly display: string;
    readonly numeric: string;
}

type ParsedBtcInput = {
    readonly sign: '' | '-';
    readonly integerPart: string;
    readonly decimalPart: string;
};

const parseBtcInput = (value: string): ParsedBtcInput => {
    const normalized = stripCommas(value.trim());
    const isNegative = normalized.startsWith('-');
    const unsigned = isNegative ? normalized.slice(1) : normalized;
    const [rawIntPart = '', rawDecimalPart = ''] = unsigned.split('.');

    return {
        sign: isNegative ? '-' : '',
        integerPart: rawIntPart.replace(/^0+(?=\d)/u, ''),
        decimalPart: rawDecimalPart,
    };
};

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

const buildBtcInputResult = (
    sign: '' | '-',
    integerPart: string,
    decimalPart: string,
): NormalizeBtcInputResult => {
    const integerPartWithCommas = addThousandSeparators(integerPart);
    const groupedDecimalPart = formatGroupedBtcInputDecimal(decimalPart);

    return {
        display:
            groupedDecimalPart === ''
                ? `${sign}${integerPartWithCommas}`
                : `${sign}${integerPartWithCommas}.${groupedDecimalPart}`,
        numeric:
            decimalPart === '' ? `${sign}${integerPart}` : `${sign}${integerPart}.${decimalPart}`,
    };
};

export const normalizeBtcInput = (value: string): NormalizeBtcInputResult => {
    const parsed = parseBtcInput(value);

    return buildBtcInputResult(
        parsed.sign,
        parsed.integerPart,
        limitBtcDecimalDigits(parsed.decimalPart),
    );
};

export const normalizeBtcInputPreservingMidEdit = (value: string): NormalizeBtcInputResult => {
    const parsed = parseBtcInput(value);

    return buildBtcInputResult(parsed.sign, parsed.integerPart, parsed.decimalPart.slice(0, 8));
};
