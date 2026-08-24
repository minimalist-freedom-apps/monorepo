import type { Task } from '@evolu/common';
import type { CurrencyCode } from '@minimalist-apps/fiat';
import type { RateBtcPerFiat } from '../converter/rate';

export interface CurrencyEntity<T extends CurrencyCode = CurrencyCode> {
    readonly code: T;
    readonly name: string;
    readonly rate: RateBtcPerFiat;
}

export type CurrencyMap = {
    [K in CurrencyCode]?: CurrencyEntity<K>;
};

export interface FetchRatesError {
    readonly type: 'FetchRatesError';
}

export const FetchRatesError = (): FetchRatesError => ({
    type: 'FetchRatesError' as const,
});

export type FetchRates = Task<CurrencyMap, FetchRatesError>;

export interface FetchRatesDep {
    readonly fetchRates: FetchRates;
}
