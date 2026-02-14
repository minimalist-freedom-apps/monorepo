import type { CurrencyCode } from '@evolu/common';
import {
    type AmountBtc,
    btcToSats,
    formatBtcWithCommas,
    formatSats,
} from '@minimalist-apps/bitcoin';
import type { RateBtcPerFiat } from '../../converter/rate';
import type { BtcMode } from '../../state/State';

const ONE_SAT_BTC = 0.00000001;
const MIN_SUPPORTED_BTC = 0.000000000000001;

const formatScientificBtc = (rateBtcPerFiat: number): string => {
    const [mantissa, exponent] = rateBtcPerFiat.toExponential().split('e');
    const normalizedMantissa = Number.parseFloat(Number(mantissa).toFixed(8)).toString();
    const normalizedExponent = Number(exponent);

    return `${normalizedMantissa}E${normalizedExponent}`;
};

export const formatMoscowTime = (
    btcMode: BtcMode,
    rateBtcPerFiat: RateBtcPerFiat<CurrencyCode>,
): string => {
    const rateAsAmountBtc = rateBtcPerFiat as unknown as AmountBtc;

    if (btcMode === 'sats') {
        return `${formatSats(btcToSats(rateAsAmountBtc)).padStart(16)} Sats`;
    }

    if (rateBtcPerFiat >= ONE_SAT_BTC) {
        return `${formatBtcWithCommas(rateAsAmountBtc)} BTC`;
    }

    if (rateBtcPerFiat >= MIN_SUPPORTED_BTC) {
        return `${formatScientificBtc(rateBtcPerFiat)} BTC`;
    }

    return '0';
};
