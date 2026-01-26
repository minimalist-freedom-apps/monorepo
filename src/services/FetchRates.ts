import {
    String as EvoluString,
    type Result,
    type TypeError,
    brand,
    err,
    ok,
} from '@evolu/common';

export interface CurrencyCodeError extends TypeError<'CurrencyCode'> {}

export const CurrencyCode = brand('CurrencyCode', EvoluString, value =>
    /^[A-Z]{3}$/.test(value)
        ? ok(value)
        : err<CurrencyCodeError>({ type: 'CurrencyCode', value }),
);

export type CurrencyCode = typeof CurrencyCode.Type;

export interface CurrencyRate {
    readonly code: CurrencyCode;
    readonly name: string;
    readonly rate: number;
}

export type RatesMap = Readonly<Record<CurrencyCode, CurrencyRate>>;

export interface FetchRatesError {
    readonly type: 'FetchRatesError';
}

export const FetchRatesError = (): FetchRatesError => ({
    type: 'FetchRatesError' as const,
});

export type FetchRates = () => Promise<Result<RatesMap, FetchRatesError>>;
