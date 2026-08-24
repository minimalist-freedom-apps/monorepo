import { tryAsync } from '@evolu/common';
import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectEntries, typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';
import { getPositiveFiniteReciprocal, isUnknownRecord } from './rateApiValidation.js';

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
                const data: unknown = await response.json();

                if (!isUnknownRecord(data) || !isUnknownRecord(data.rates)) {
                    throw new Error('Invalid Coingecko response');
                }

                const rates = typedObjectEntries(data.rates).reduce<CurrencyMap>(
                    (acc, [code, info]) => {
                        if (!isUnknownRecord(info) || typeof info.type !== 'string') {
                            throw new Error('Invalid Coingecko rate');
                        }

                        if (info.type === 'fiat') {
                            const reciprocal = getPositiveFiniteReciprocal(info.value);

                            if (
                                typeof info.name !== 'string' ||
                                info.name.length === 0 ||
                                reciprocal === null
                            ) {
                                throw new Error('Invalid Coingecko fiat rate');
                            }

                            const upperCode = String(code).toUpperCase();
                            const codeResult = CurrencyCode.fromUnknown(upperCode);

                            if (codeResult.ok && isFiatCurrency(codeResult.value)) {
                                acc[codeResult.value] = {
                                    code: codeResult.value,
                                    name: info.name,
                                    rate: RateBtcPerFiat(codeResult.value).from(reciprocal),
                                };
                            }
                        }

                        return acc;
                    },
                    {},
                );

                if (typedObjectKeys(rates).length === 0) {
                    throw new Error('Coingecko returned no fiat rates');
                }

                return rates;
            },
            _ => FetchRatesError(),
        );
