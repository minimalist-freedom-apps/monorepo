import type { Brand, CurrencyCode } from '@evolu/common';

/**
 * Formula: Rate = Bitcoin / Fiat
 */
export type RateBtcPerFiat<Currency extends CurrencyCode = CurrencyCode> = number &
    Brand<'RateBtcPerFiat'> &
    Brand<`RateBtcPerFiatCurrency:${Currency}`>;

export const asRateBtcPerFiat = <Currency extends CurrencyCode>(
    value: number,
): RateBtcPerFiat<Currency> => value as RateBtcPerFiat<Currency>;

export const RateBtcPerFiat = <Currency extends CurrencyCode>(
    _: Currency,
): {
    readonly from: (value: number) => RateBtcPerFiat<Currency>;
} => ({
    from: value => asRateBtcPerFiat<Currency>(value),
});
