import { CurrencyCode, tryAsync } from '@evolu/common';
import { RateBtcPerFiat } from '../converter/rate.js';
import {
    type CurrencyMap,
    type FetchRates,
    FetchRatesError,
} from './FetchRates.js';

interface BitpayRateItem {
    readonly code: string;
    readonly name: string;
    readonly rate: number;
}

interface BitpayResponse {
    readonly data: readonly BitpayRateItem[];
}

export interface FetchBitpayRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

export const createFetchBitpayRates =
    (deps: FetchBitpayRatesDeps): FetchRates =>
    () =>
        tryAsync(
            async () => {
                const response = await deps.fetch('https://bitpay.com/rates');

                if (!response.ok) {
                    throw new Error('Bitpay API failed');
                }
                const data: BitpayResponse = await response.json();

                const rates = data.data.reduce<CurrencyMap>((acc, item) => {
                    const code = CurrencyCode.from(item.code);

                    if (code.ok && code.value !== 'BTC') {
                        acc[code.value] = {
                            code: code.value,
                            name: item.name,
                            rate: RateBtcPerFiat(code.value).from(
                                1 / item.rate,
                            ),
                        };
                    }

                    return acc;
                }, {});

                return rates;
            },
            _ => FetchRatesError(),
        );
