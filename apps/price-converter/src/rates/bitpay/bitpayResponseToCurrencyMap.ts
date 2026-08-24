import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../../converter/rate.js';
import type { CurrencyMap } from '../FetchRates.js';
import { getPositiveFiniteReciprocal } from '../positiveFiniteNumber.js';
import type { BitpayResponse } from './BitpayResponse.js';

export const bitpayResponseToCurrencyMap = (response: BitpayResponse): CurrencyMap => {
    const rates = response.data.reduce<CurrencyMap>((acc, item) => {
        const reciprocal = getPositiveFiniteReciprocal(item.rate);

        if (reciprocal === null) {
            throw new Error('Invalid Bitpay rate');
        }

        const code = CurrencyCode.fromUnknown(item.code);

        if (code.ok && isFiatCurrency(code.value)) {
            acc[code.value] = {
                code: code.value,
                name: item.name,
                rate: RateBtcPerFiat(code.value).from(reciprocal),
            };
        }

        return acc;
    }, {});

    if (typedObjectKeys(rates).length === 0) {
        throw new Error('Bitpay returned no fiat rates');
    }

    return rates;
};
