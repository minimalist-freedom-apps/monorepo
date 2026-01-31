import { CurrencyCode, err, ok } from '@evolu/common';
import { typedObjectKeys } from '@minimalistic-apps/type-utils';
import {
    type CurrencyEntity,
    type CurrencyMap,
    type FetchRates,
    FetchRatesError,
} from './FetchRates.js';

export interface FetchAverageRatesDep {
    readonly fetchAverageRates: FetchRates;
}

export interface FetchAverageRatesDeps {
    readonly fetchRates: readonly FetchRates[];
}

export const createFetchAverageRates =
    (deps: FetchAverageRatesDeps): FetchRates =>
    async () => {
        const results = await Promise.all(
            deps.fetchRates.map(fetch => fetch()),
        );

        const sources = results
            .filter(result => result.ok)
            .map(result => (result.ok ? result.value : ({} as CurrencyMap)));

        if (sources.length === 0) {
            return err(FetchRatesError());
        }

        const allCodes = sources.flatMap(source => typedObjectKeys(source));
        const uniqueCodes = [...new Set(allCodes)];

        const allRates = uniqueCodes.reduce<Record<string, CurrencyEntity>>(
            (acc, code) => {
                const codeResult = CurrencyCode.from(code);
                if (!codeResult.ok) return acc;

                const validCode = codeResult.value;
                const rates = sources
                    .filter(source => source[validCode])
                    .map(source => source[validCode].rate);

                if (rates.length > 0) {
                    const avgRate =
                        rates.reduce((sum, rate) => sum + rate, 0) /
                        rates.length;
                    const firstSource = sources.find(s => s[validCode]);
                    if (firstSource) {
                        acc[code] = {
                            code: validCode,
                            name: firstSource[validCode].name,
                            rate: avgRate,
                        };
                    }
                }

                return acc;
            },
            {},
        );

        return ok(allRates);
    };
