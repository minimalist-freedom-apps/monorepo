import type { Brand, CurrencyCode } from '@evolu/common';

export type FiatAmount<Currency extends CurrencyCode = CurrencyCode> = number &
    Brand<'FiatAmount'> &
    Brand<`FiatAmountCurrency:${Currency}`>;

export const asFiatAmount = <Currency extends CurrencyCode>(
    value: number,
): FiatAmount<Currency> => value as FiatAmount<Currency>;

export const FiatAmount = <Currency extends CurrencyCode>(
    _: Currency,
): {
    readonly from: (value: number) => FiatAmount<Currency>;
} => ({
    from: value => asFiatAmount<Currency>(value),
});
