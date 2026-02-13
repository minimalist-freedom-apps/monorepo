import type { AmountSats } from './types';

export const formatSats = (sats: AmountSats): string => {
    const formatted = sats.toFixed(3).replace(/\.?0+$/, '');
    const [intPart, decimalPart] = formatted.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart ? `${withCommas}.${decimalPart}` : withCommas;
};
