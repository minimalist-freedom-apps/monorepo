import { err, fetch, trySync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { BlockchainInfoResponse } from './BlockchainInfoResponse.js';
import { blockchainInfoResponseToCurrencyMap } from './blockchainInfoResponseToCurrencyMap.js';

export const fetchBlockchainInfoRates: FetchRates = async run => {
    const response = await run(fetch('https://blockchain.info/ticker', 'json'));

    if (!response.ok) {
        return err(FetchRatesError());
    }

    const data = BlockchainInfoResponse.fromUnknown(response.value);

    if (!data.ok) {
        return err(FetchRatesError());
    }

    return trySync(
        () => blockchainInfoResponseToCurrencyMap(data.value),
        _ => FetchRatesError(),
    );
};
