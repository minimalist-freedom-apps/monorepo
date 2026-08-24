import { tryAsync } from '@evolu/common';
import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';
import { BitpayResponse, getPositiveFiniteReciprocal } from './rateApiValidation.js';

interface FetchBitpayRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

const BASE_CURRENCY = 'BTC';

export const createFetchBitpayRates =
    (deps: FetchBitpayRatesDeps): FetchRates =>
    options =>
        tryAsync(
            async () => {
                const response = await deps.fetch(`https://bitpay.com/rates/${BASE_CURRENCY}`, {
                    ...(options?.signal !== undefined ? { signal: options.signal } : {}),
                });

                if (!response.ok) {
                    throw new Error('Bitpay API failed');
                }
                const dataResult = BitpayResponse.fromUnknown(await response.json());

                if (!dataResult.ok) {
                    throw new Error('Invalid Bitpay response');
                }

                const rates = dataResult.value.data.reduce<CurrencyMap>((acc, item) => {
                    const reciprocal = getPositiveFiniteReciprocal(item.rate);

                    if (reciprocal === null) {
                        throw new Error('Invalid Bitpay rate');
                    }

                    const code = CurrencyCode.fromUnknown(item.code);

                    if (code.ok && isFiatCurrency(code.value)) {
                        acc[code.value] = {
                            code: code.value,
                            name: item.name,
                            rate: RateBtcPerFiat(code.value).from(reciprocal),
                        };
                    }

                    return acc;
                }, {});

                if (typedObjectKeys(rates).length === 0) {
                    throw new Error('Bitpay returned no fiat rates');
                }

                return rates;
            },
            _ => FetchRatesError(),
        );
