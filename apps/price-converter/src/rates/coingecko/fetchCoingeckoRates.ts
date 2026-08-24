import { err, fetch, trySync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { CoingeckoResponse } from './CoingeckoResponse.js';
import { coingeckoResponseToCurrencyMap } from './coingeckoResponseToCurrencyMap.js';

export const fetchCoingeckoRates: FetchRates = async run => {
    const response = await run(fetch('https://api.coingecko.com/api/v3/exchange_rates', 'json'));

    if (!response.ok) {
        return err(FetchRatesError());
    }

    const data = CoingeckoResponse.fromUnknown(response.value);

    if (!data.ok) {
        return err(FetchRatesError());
    }

    return trySync(
        () => coingeckoResponseToCurrencyMap(data.value),
        _ => FetchRatesError(),
    );
};
