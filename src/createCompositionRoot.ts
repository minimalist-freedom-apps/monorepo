import { createFetchCoingeckoRates } from './services/fetchCoingeckoRates.js';
import { createFetchBitpayRates } from './services/fetchBitpayRates.js';
import { createFetchBlockchainInfoRates } from './services/fetchBlockchainInfoRates.js';
import { createFetchAverageRates } from './services/fetchAverageRates.js';

export const createCompositionRoot = () => {
    const fetchDeps = {
        fetch: globalThis.fetch,
    };

    const fetchCoingeckoRates = createFetchCoingeckoRates(fetchDeps);
    const fetchBitpayRates = createFetchBitpayRates(fetchDeps);
    const fetchBlockchainInfoRates = createFetchBlockchainInfoRates(fetchDeps);

    const fetchAverageRates = createFetchAverageRates({
        fetchRates: [fetchCoingeckoRates, fetchBitpayRates, fetchBlockchainInfoRates],
    });

    return {
        fetchCoingeckoRates,
        fetchBitpayRates,
        fetchBlockchainInfoRates,
        fetchAverageRates,
    };
};
