import { String as EvoluString, type Result, type TypeError, brand, err, ok } from '@evolu/common';

export interface CurrencyCodeError extends TypeError<'CurrencyCode'> {}

export const CurrencyCode = brand('CurrencyCode', EvoluString, value =>
    /^[A-Z]{3}$/.test(value) ? ok(value) : err<CurrencyCodeError>({ type: 'CurrencyCode', value }),
);

export type CurrencyCode = typeof CurrencyCode.Type;

export interface CurrencyRate {
    readonly code: CurrencyCode;
    readonly name: string;
    readonly rate: number;
}

export interface RatesMap {
    readonly [code: CurrencyCode]: CurrencyRate;
}

export interface FetchRatesError {
    readonly type: 'FetchRatesError';
    readonly source: string;
    readonly message: string;
}

export interface AllApisFailed {
    readonly type: 'AllApisFailed';
    readonly message: string;
}

export type FetchRates = () => Promise<Result<RatesMap, FetchRatesError>>;
