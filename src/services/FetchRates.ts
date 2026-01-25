import type { Result } from '@evolu/common';

export interface CurrencyRate {
    readonly code: string;
    readonly name: string;
    readonly rate: number;
}

export interface RatesMap {
    readonly [code: string]: CurrencyRate;
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
