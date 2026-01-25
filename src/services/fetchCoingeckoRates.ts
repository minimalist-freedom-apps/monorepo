import { tryAsync } from '@evolu/common';
import { FetchRates, CurrencyRate } from './FetchRates.js';

interface CoingeckoRateInfo {
    readonly name: string;
    readonly unit: string;
    readonly value: number;
    readonly type: string;
}

interface CoingeckoResponse {
    readonly rates: {
        readonly [code: string]: CoingeckoRateInfo;
    };
}

export interface FetchCoingeckoRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

export const createFetchCoingeckoRates =
    (deps: FetchCoingeckoRatesDeps): FetchRates =>
    () =>
        tryAsync(
            async () => {
                const response = await deps.fetch(
                    'https://api.coingecko.com/api/v3/exchange_rates',
                );
                if (!response.ok) throw new Error('Coingecko API failed');
                const data: CoingeckoResponse = await response.json();

                const rates: Record<string, CurrencyRate> = {};
                Object.entries(data.rates).forEach(([code, info]) => {
                    if (info.type === 'fiat') {
                        rates[code.toUpperCase()] = {
                            code: code.toUpperCase(),
                            name: info.name,
                            rate: 1 / info.value,
                        };
                    }
                });
                return rates;
            },
            error => ({
                type: 'FetchRatesError',
                source: 'Coingecko',
                message: String(error),
            }),
        );
