import { tryAsync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { CoingeckoResponse } from './CoingeckoResponse.js';
import { coingeckoResponseToCurrencyMap } from './coingeckoResponseToCurrencyMap.js';

interface FetchCoingeckoRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

export const createFetchCoingeckoRates =
    (deps: FetchCoingeckoRatesDeps): FetchRates =>
    options =>
        tryAsync(
            async () => {
                const response = await deps.fetch(
                    'https://api.coingecko.com/api/v3/exchange_rates',
                    {
                        ...(options?.signal !== undefined ? { signal: options.signal } : {}),
                    },
                );

                if (!response.ok) {
                    throw new Error('Coingecko API failed');
                }
                const dataResult = CoingeckoResponse.fromUnknown(await response.json());

                if (!dataResult.ok) {
                    throw new Error('Invalid Coingecko response');
                }

                return coingeckoResponseToCurrencyMap(dataResult.value);
            },
            _ => FetchRatesError(),
        );
