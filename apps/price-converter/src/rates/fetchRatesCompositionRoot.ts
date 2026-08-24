import { createFetchBitpayRates } from './bitpay/fetchBitpayRates';
import { createFetchBlockchainInfoRates } from './blockchainInfo/fetchBlockchainInfoRates';
import { createFetchCoingeckoRates } from './coingecko/fetchCoingeckoRates';
import type { FetchRates } from './FetchRates';
import { createFetchAverageRates } from './fetchAverageRates';

const RATE_SOURCE_TIMEOUT_MILLISECONDS = 10_000;

export const createFetchRatesCompositionRoot = (): FetchRates => {
    const fetchDeps = {
        // Important to be wrapped to preserve the correct `this` context
        fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
    };

    const fetchCoingeckoRates = createFetchCoingeckoRates(fetchDeps);
    const fetchBitpayRates = createFetchBitpayRates(fetchDeps);
    const fetchBlockchainInfoRates = createFetchBlockchainInfoRates(fetchDeps);

    return createFetchAverageRates({
        fetchRates: [fetchCoingeckoRates, fetchBitpayRates, fetchBlockchainInfoRates],
        timeoutMilliseconds: RATE_SOURCE_TIMEOUT_MILLISECONDS,
        createAbortController: () => new AbortController(),
        setTimeout: (listener, milliseconds) => globalThis.setTimeout(listener, milliseconds),
        clearTimeout: timeoutId => globalThis.clearTimeout(timeoutId),
    });
};
