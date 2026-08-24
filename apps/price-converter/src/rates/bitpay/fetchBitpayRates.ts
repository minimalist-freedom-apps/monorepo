import { err, fetch, trySync } from '@evolu/common';
import { type FetchRates, FetchRatesError } from '../FetchRates.js';
import { BitpayResponse } from './BitpayResponse.js';
import { bitpayResponseToCurrencyMap } from './bitpayResponseToCurrencyMap.js';

const BASE_CURRENCY = 'BTC';

export const fetchBitpayRates: FetchRates = async run => {
    const response = await run(fetch(`https://bitpay.com/rates/${BASE_CURRENCY}`, 'json'));

    if (!response.ok) {
        return err(FetchRatesError());
    }

    const data = BitpayResponse.fromUnknown(response.value);

    if (!data.ok) {
        return err(FetchRatesError());
    }

    return trySync(
        () => bitpayResponseToCurrencyMap(data.value),
        _ => FetchRatesError(),
    );
};
