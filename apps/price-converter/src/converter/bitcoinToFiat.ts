import type { AmountBtc } from '@minimalist-apps/bitcoin';
import { asFiatAmount, type CurrencyCode, type FiatAmount } from '@minimalist-apps/fiat';
import type { RateBtcPerFiat } from './rate';

export const bitcoinToFiat = <T extends CurrencyCode>(
    bitcoinAmount: AmountBtc,
    rate: RateBtcPerFiat<T>,
): FiatAmount<T> => asFiatAmount<T>(bitcoinAmount / rate);
