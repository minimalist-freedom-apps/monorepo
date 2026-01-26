import { tryAsync } from '@evolu/common';
import {
    CurrencyCode,
    FetchRatesError,
    type CurrencyRate,
    type FetchRates,
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
                if (!response.ok) throw new Error('Bitpay API failed');
                const data: BitpayResponse = await response.json();

                const rates: Record<string, CurrencyRate> = {};
                data.data.forEach(item => {
                    if (item.code !== 'BTC') {
                        const codeResult = CurrencyCode.from(item.code);
                        if (codeResult.ok) {
                            rates[item.code] = {
                                code: codeResult.value,
                                name: item.name,
                                rate: 1 / item.rate,
                            };
                        }
                    }
                });
                return rates;
            },
            _ => FetchRatesError(),
        );
