import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectEntries, typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../../converter/rate.js';
import type { CurrencyMap } from '../FetchRates.js';
import { getPositiveFiniteReciprocal } from '../positiveFiniteNumber.js';
import type { CoingeckoResponse } from './CoingeckoResponse.js';

export const coingeckoResponseToCurrencyMap = (response: CoingeckoResponse): CurrencyMap => {
    const rates = typedObjectEntries(response.rates).reduce<CurrencyMap>((acc, [code, info]) => {
        if (info === undefined) {
            return acc;
        }

        if (info.type === 'fiat') {
            const reciprocal = getPositiveFiniteReciprocal(info.value);

            if (reciprocal === null) {
                throw new Error('Invalid Coingecko fiat rate');
            }

            const upperCode = String(code).toUpperCase();
            const codeResult = CurrencyCode.fromUnknown(upperCode);

            if (codeResult.ok && isFiatCurrency(codeResult.value)) {
                acc[codeResult.value] = {
                    code: codeResult.value,
                    name: info.name,
                    rate: RateBtcPerFiat(codeResult.value).from(reciprocal),
                };
            }
        }

        return acc;
    }, {});

    if (typedObjectKeys(rates).length === 0) {
        throw new Error('Coingecko returned no fiat rates');
    }

    return rates;
};
