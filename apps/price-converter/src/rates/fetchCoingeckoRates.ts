import { CurrencyCode, tryAsync } from '@evolu/common';
import { typedObjectEntries } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';

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

interface FetchCoingeckoRatesDeps {
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

                if (!response.ok) {
                    throw new Error('Coingecko API failed');
                }
                const data: CoingeckoResponse = await response.json();

                const rates = typedObjectEntries(data.rates).reduce<CurrencyMap>(
                    (acc, [code, info]) => {
                        if (info.type === 'fiat') {
                            const upperCode = String(code).toUpperCase();
                            const codeResult = CurrencyCode.from(upperCode);

                            if (codeResult.ok) {
                                acc[codeResult.value] = {
                                    code: codeResult.value,
                                    name: info.name,
                                    rate: RateBtcPerFiat(codeResult.value).from(1 / info.value),
                                };
                            }
                        }

                        return acc;
                    },
                    {},
                );

                return rates;
            },
            _ => FetchRatesError(),
        );
