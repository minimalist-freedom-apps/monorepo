import { tryAsync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { BlockchainInfoResponse } from './BlockchainInfoResponse.js';
import { blockchainInfoResponseToCurrencyMap } from './blockchainInfoResponseToCurrencyMap.js';

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
                const dataResult = BlockchainInfoResponse.fromUnknown(await response.json());

                if (!dataResult.ok) {
                    throw new Error('Invalid Blockchain.info response');
                }

                return blockchainInfoResponseToCurrencyMap(dataResult.value);
            },
            _ => FetchRatesError(),
        );
