import { fetchBitpayRates } from './bitpay/fetchBitpayRates';
import { fetchBlockchainInfoRates } from './blockchainInfo/fetchBlockchainInfoRates';
import { fetchCoingeckoRates } from './coingecko/fetchCoingeckoRates';
import type { FetchRates } from './FetchRates';
import { createFetchAverageRates } from './fetchAverageRates';

const RATE_SOURCE_TIMEOUT = '10s';

export const createFetchRatesCompositionRoot = (): FetchRates =>
    createFetchAverageRates({
        fetchRates: [fetchCoingeckoRates, fetchBitpayRates, fetchBlockchainInfoRates],
        sourceTimeout: RATE_SOURCE_TIMEOUT,
    });
