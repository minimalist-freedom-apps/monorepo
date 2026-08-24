import { tryAsync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { BitpayResponse } from './BitpayResponse.js';
import { bitpayResponseToCurrencyMap } from './bitpayResponseToCurrencyMap.js';

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

                return bitpayResponseToCurrencyMap(dataResult.value);
            },
            _ => FetchRatesError(),
        );
