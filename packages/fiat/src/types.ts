import { type Brand, brand, String as EvoluString, err, ok, type TypeError } from '@evolu/common';

export interface CurrencyCodeError extends TypeError<'CurrencyCode'> {
    readonly value: string;
}

export const CurrencyCode = brand(
    'CurrencyCode',
    EvoluString,
    value =>
        /^[A-Z]{3}$/.test(value) ? ok() : err<CurrencyCodeError>({ type: 'CurrencyCode', value }),
    error => `Invalid currency code: ${error.value}`,
);
export type CurrencyCode = typeof CurrencyCode.Output;

export interface FiatCurrency {
    readonly code: CurrencyCode;
    readonly name: string;
}

export type FiatAmount<Currency extends CurrencyCode = CurrencyCode> = number &
    Brand<'FiatAmount'> &
    Brand<`FiatAmountCurrency:${Currency}`>;

export const asFiatAmount = <Currency extends CurrencyCode>(value: number): FiatAmount<Currency> =>
    value as FiatAmount<Currency>;

export const FiatAmount = <Currency extends CurrencyCode>(
    _: Currency,
): {
    readonly from: (value: number) => FiatAmount<Currency>;
} => ({
    from: value => asFiatAmount<Currency>(value),
});
