import { CurrencyCode, tryAsync } from '@evolu/common';
import { typedObjectEntries } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';

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
                const response = await deps.fetch('https://blockchain.info/ticker');

                if (!response.ok) {
                    throw new Error('Blockchain.info API failed');
                }
                const data: BlockchainInfoResponse = await response.json();

                const rates = typedObjectEntries(data).reduce<CurrencyMap>((acc, [code, info]) => {
                    const codeResult = CurrencyCode.from(String(code));

                    if (codeResult.ok) {
                        acc[codeResult.value] = {
                            code: codeResult.value,
                            name: String(codeResult.value),
                            rate: RateBtcPerFiat(codeResult.value).from(1 / info.last),
                        };
                    }

                    return acc;
                }, {});

                return rates;
            },
            _ => FetchRatesError(),
        );
