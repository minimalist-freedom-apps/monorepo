import { PositiveFiniteNumber } from '@evolu/common';
import { CurrencyCode, isFiatCurrency } from '@minimalist-apps/fiat';
import { typedObjectEntries, typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../../converter/rate.js';
import type { CurrencyMap } from '../FetchRates.js';
import type { BlockchainInfoResponse } from './BlockchainInfoResponse.js';

export const blockchainInfoResponseToCurrencyMap = (
    response: BlockchainInfoResponse,
): CurrencyMap => {
    const rates = typedObjectEntries(response).reduce<CurrencyMap>((acc, [code, info]) => {
        if (info === undefined) {
            return acc;
        }

        const reciprocal = PositiveFiniteNumber.orNull(1 / info.last);

        if (reciprocal === null) {
            throw new Error('Invalid Blockchain.info rate');
        }

        const codeResult = CurrencyCode.fromUnknown(String(code));

        if (codeResult.ok && isFiatCurrency(codeResult.value)) {
            acc[codeResult.value] = {
                code: codeResult.value,
                name: String(codeResult.value),
                rate: RateBtcPerFiat(codeResult.value).from(reciprocal),
            };
        }

        return acc;
    }, {});

    if (typedObjectKeys(rates).length === 0) {
        throw new Error('Blockchain.info returned no fiat rates');
    }

    return rates;
};
