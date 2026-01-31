import type { AmountBtc } from './types';

/**
 * Format number with custom grouping (e.g., 0.00,001,000)
 */
export const formatBtcWithCommas = (value: AmountBtc): string => {
    if (!value || Number.isNaN(Number(value))) {
        return '0';
    }

    const num = Number.parseFloat(String(value));

    if (num === 0) {
        return '0';
    }

    // Handle very small numbers - treat as 0
    if (Math.abs(num) < 1e-8) {
        return '0';
    }

    // Format with 8 decimal places
    const str = num.toFixed(8);
    const [intPart, decPart] = str.split('.');

    if (!decPart) {
        return intPart;
    }

    // Add commas every 3 digits in decimal part from right to left
    let result = '';
    let count = 0;

    for (let i = decPart.length - 1; i >= 0; i--) {
        if (count === 3 && i < decPart.length - 1) {
            result = `,${result}`;
            count = 0;
        }
        result = decPart[i] + result;
        count++;
    }

    return intPart + (result ? `.${result}` : '');
};
