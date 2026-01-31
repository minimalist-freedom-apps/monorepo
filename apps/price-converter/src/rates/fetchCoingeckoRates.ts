import { CurrencyCode, tryAsync } from '@evolu/common';
import { typedObjectEntries } from '@minimalistic-apps/type-utils';
import {
    type CurrencyRate,
    type FetchRates,
    FetchRatesError,
} from './FetchRates.js';

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

                const rates = typedObjectEntries(data.rates).reduce<
                    Record<string, CurrencyRate>
                >((acc, [code, info]) => {
                    if (info.type === 'fiat') {
                        const upperCode = String(code).toUpperCase();
                        const codeResult = CurrencyCode.from(upperCode);
                        if (codeResult.ok) {
                            acc[upperCode] = {
                                code: codeResult.value,
                                name: info.name,
                                rate: 1 / info.value,
                            };
                        }
                    }

                    return acc;
                }, {});

                return rates;
            },
            _ => FetchRatesError(),
        );
