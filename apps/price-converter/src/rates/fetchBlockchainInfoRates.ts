import { tryAsync } from '@evolu/common';
import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectEntries, typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';
import { getPositiveFiniteReciprocal, isUnknownRecord } from './rateApiValidation.js';

interface FetchBlockchainInfoRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

export const createFetchBlockchainInfoRates =
    (deps: FetchBlockchainInfoRatesDeps): FetchRates =>
    options =>
        tryAsync(
            async () => {
                const response = await deps.fetch('https://blockchain.info/ticker', {
                    ...(options?.signal !== undefined ? { signal: options.signal } : {}),
                });

                if (!response.ok) {
                    throw new Error('Blockchain.info API failed');
                }
                const data: unknown = await response.json();

                if (!isUnknownRecord(data)) {
                    throw new Error('Invalid Blockchain.info response');
                }

                const rates = typedObjectEntries(data).reduce<CurrencyMap>((acc, [code, info]) => {
                    const reciprocal = isUnknownRecord(info)
                        ? getPositiveFiniteReciprocal(info.last)
                        : null;

                    if (!isUnknownRecord(info) || reciprocal === null) {
                        throw new Error('Invalid Blockchain.info rate');
                    }

                    const codeResult = CurrencyCode.fromUnknown(String(code));

                    if (codeResult.ok && isFiatCurrency(codeResult.value)) {
                        acc[codeResult.value] = {
                            code: codeResult.value,
                            name: String(codeResult.value),
                            rate: RateBtcPerFiat(codeResult.value).from(reciprocal),
                        };
                    }

                    return acc;
                }, {});

                if (typedObjectKeys(rates).length === 0) {
                    throw new Error('Blockchain.info returned no fiat rates');
                }

                return rates;
            },
            _ => FetchRatesError(),
        );
