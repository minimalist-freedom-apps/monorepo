import { createFetchAverageRates } from './services/fetchAverageRates.js';
import { createFetchBitpayRates } from './services/fetchBitpayRates.js';
import { createFetchBlockchainInfoRates } from './services/fetchBlockchainInfoRates.js';
import { createFetchCoingeckoRates } from './services/fetchCoingeckoRates.js';

export const createCompositionRoot = () => {
    const fetchDeps = {
        // Important to be wrapped to preserve the correct `this` context
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            globalThis.fetch(input, init),
    };

    const fetchCoingeckoRates = createFetchCoingeckoRates(fetchDeps);
    const fetchBitpayRates = createFetchBitpayRates(fetchDeps);
    const fetchBlockchainInfoRates = createFetchBlockchainInfoRates(fetchDeps);

    const fetchAverageRates = createFetchAverageRates({
        fetchRates: [
            fetchCoingeckoRates,
            fetchBitpayRates,
            fetchBlockchainInfoRates,
        ],
    });

    return {
        fetchCoingeckoRates,
        fetchBitpayRates,
        fetchBlockchainInfoRates,
        fetchAverageRates,
    };
};
