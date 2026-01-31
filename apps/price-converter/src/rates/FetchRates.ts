import type { CurrencyCode, Result, TypeError } from '@evolu/common';
import type { RateBtcPerFiat } from '../converter/rate';

export interface CurrencyCodeError extends TypeError<'CurrencyCode'> {}

export interface CurrencyRate<T extends CurrencyCode> {
    readonly code: T;
    readonly name: string;
    readonly rate: RateBtcPerFiat;
}

export type RatesMap = Readonly<
    Record<CurrencyCode, CurrencyRate<CurrencyCode>>
>;

export interface FetchRatesError {
    readonly type: 'FetchRatesError';
}

export const FetchRatesError = (): FetchRatesError => ({
    type: 'FetchRatesError' as const,
});

export type FetchRates = () => Promise<Result<RatesMap, FetchRatesError>>;
