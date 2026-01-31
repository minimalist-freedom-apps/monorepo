import type { AmountBtc } from '@minimalistic-apps/bitcoin';
import type { FiatAmount } from '@minimalistic-apps/fiat';

import type { Brand, CurrencyCode } from '@evolu/common';

/**
 * Formula: Rate = Bitcoin / Fiat
 */
export type RateBtcPerFiat<Currency extends CurrencyCode = CurrencyCode> =
    number &
        Brand<'RateBtcPerFiat'> &
        Brand<`RateBtcPerFiatCurrency:${Currency}`>;

export const asRateBtcPerFiat = <Currency extends CurrencyCode>(
    value: number,
): RateBtcPerFiat<Currency> => value as RateBtcPerFiat<Currency>;

export const createRateBtcPerFiat = <Currency extends CurrencyCode>(): {
    readonly from: (value: number) => RateBtcPerFiat<Currency>;
} => ({
    from: value => asRateBtcPerFiat<Currency>(value),
});
