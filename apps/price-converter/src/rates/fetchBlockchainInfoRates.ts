import { tryAsync } from '@evolu/common';
import { typedObjectEntries } from '@minimalistic-apps/type-utils';
import {
    CurrencyCode,
    type CurrencyRate,
    type FetchRates,
    FetchRatesError,
} from './FetchRates.js';

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

                const rates = typedObjectEntries(data).reduce<
                    Record<string, CurrencyRate>
                >((acc, [code, info]) => {
                    const codeResult = CurrencyCode.from(code);
                    if (codeResult.ok) {
                        acc[code] = {
                            code: codeResult.value,
                            name: code,
                            rate: 1 / info.last,
                        };
                    }
                    return acc;
                }, {});
                return rates;
            },
            _ => FetchRatesError(),
        );
