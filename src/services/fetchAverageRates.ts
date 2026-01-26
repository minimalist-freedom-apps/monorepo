import { type Result, err, ok } from '@evolu/common';
import {
    CurrencyCode,
    type AllApisFailed,
    type CurrencyRate,
    type FetchRates,
    type RatesMap,
} from './FetchRates.js';

export interface FetchAverageRatesDeps {
    readonly fetchRates: readonly FetchRates[];
}

export const createFetchAverageRates =
    (deps: FetchAverageRatesDeps) => async (): Promise<Result<RatesMap, AllApisFailed>> => {
        const results = await Promise.all(deps.fetchRates.map(fetch => fetch()));

        const sources = results
            .filter(result => result.ok)
            .map(result => (result.ok ? result.value : ({} as RatesMap)));

        if (sources.length === 0) {
            return err({
                type: 'AllApisFailed',
                message: 'All APIs failed to fetch rates',
            });
        }

        const allRates: Record<string, CurrencyRate> = {};

        const allCodes = new Set<string>();
        sources.forEach(source => {
            Object.keys(source).forEach(code => allCodes.add(code));
        });

        allCodes.forEach(code => {
            const codeResult = CurrencyCode.from(code);
            if (!codeResult.ok) return;

            const validCode = codeResult.value;
            const rates = sources
                .filter(source => source[validCode])
                .map(source => source[validCode].rate);

            if (rates.length > 0) {
                const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
                const firstSource = sources.find(s => s[validCode]);
                if (firstSource) {
                    allRates[code] = {
                        code: validCode,
                        name: firstSource[validCode].name,
                        rate: avgRate,
                    };
                }
            }
        });

        return ok(allRates);
    };
