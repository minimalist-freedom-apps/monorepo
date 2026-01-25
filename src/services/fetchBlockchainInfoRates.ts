import { tryAsync } from '@evolu/common';
import type { CurrencyRate, FetchRates } from './FetchRates.js';

interface BlockchainInfoRateInfo {
    readonly last: number;
    readonly buy: number;
    readonly sell: number;
    readonly symbol: string;
}

interface BlockchainInfoResponse {
    readonly [code: string]: BlockchainInfoRateInfo;
}

export interface FetchBlockchainInfoRatesDeps {
    readonly fetch: typeof globalThis.fetch;
}

export const createFetchBlockchainInfoRates =
    (deps: FetchBlockchainInfoRatesDeps): FetchRates =>
    () =>
        tryAsync(
            async () => {
                const response = await deps.fetch(
                    'https://blockchain.info/ticker',
                );
                if (!response.ok) throw new Error('Blockchain.info API failed');
                const data: BlockchainInfoResponse = await response.json();

                const rates: Record<string, CurrencyRate> = {};
                Object.entries(data).forEach(([code, info]) => {
                    rates[code] = {
                        code: code,
                        name: code,
                        rate: 1 / info.last,
                    };
                });
                return rates;
            },
            error => ({
                type: 'FetchRatesError',
                source: 'BlockchainInfo',
                message: String(error),
            }),
        );
