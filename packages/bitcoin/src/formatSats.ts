import type { AmountSats } from './types';

export const formatSats = (sats: AmountSats): string => {
    if (!sats || Number.isNaN(Number(sats))) return '0';

    const num = Number.parseFloat(String(sats));

    return num.toFixed(3).replace(/\.?0+$/, '');
};
