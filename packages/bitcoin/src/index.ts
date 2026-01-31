const SATOSHI = 100000000; // 1 BTC = 100,000,000 sats

export const btcToSats = (btc: number): number => {
    return btc * SATOSHI;
};

export const satsToBtc = (sats: number): number => {
    return sats / SATOSHI;
};

// Format sats with 3 decimal places
export const formatSats = (sats: string | number): string => {
    if (!sats || Number.isNaN(Number(sats))) return '0';

    const num = Number.parseFloat(String(sats));

    return num.toFixed(3).replace(/\.?0+$/, '');
};

export { formatBtcWithCommas } from './formatBtcWithCommas';
