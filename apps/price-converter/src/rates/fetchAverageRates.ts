import {
    allSettled,
    err,
    ok,
    type PositiveDuration,
    PositiveFiniteNumber,
    timeout,
} from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';

interface FetchAverageRatesDeps {
    readonly fetchRates: readonly FetchRates[];
    readonly sourceTimeout: PositiveDuration;
}

const RATE_SOURCE_CONCURRENCY = 3;

export const createFetchAverageRates =
    (deps: FetchAverageRatesDeps): FetchRates =>
    async run => {
        const sourceTasks = deps.fetchRates.map(fetchRates =>
            timeout(fetchRates, deps.sourceTimeout),
        );
        const results = await run.ok(
            allSettled(sourceTasks, { concurrency: RATE_SOURCE_CONCURRENCY }),
        );

        const sources = results.filter(result => result.ok).map(result => result.value);

        if (sources.length === 0) {
            return err(FetchRatesError());
        }

        const allCodes = sources.flatMap(source => typedObjectKeys(source));
        const uniqueCodes = [...new Set(allCodes)];

        const allRates = uniqueCodes.reduce<CurrencyMap>((acc, code) => {
            const codeResult = CurrencyCode.fromUnknown(code);

            if (!codeResult.ok) {
                return acc;
            }

            const validCode = codeResult.value;
            const entities = sources.flatMap(source => {
                const entity = source[validCode];

                return entity !== undefined && PositiveFiniteNumber.is(entity.rate) ? [entity] : [];
            });

            const firstEntity = entities.at(0);

            if (firstEntity === undefined) {
                return acc;
            }

            const avgRate =
                entities.reduce((sum, entity) => sum + entity.rate, 0) / entities.length;
            const avgRateResult = PositiveFiniteNumber.fromUnknown(avgRate);

            if (!avgRateResult.ok) {
                return acc;
            }

            acc[code] = {
                code: validCode,
                name: firstEntity.name,
                rate: RateBtcPerFiat(validCode).from(avgRateResult.value),
            };

            return acc;
        }, {});

        if (typedObjectKeys(allRates).length === 0) {
            return err(FetchRatesError());
        }

        return ok(allRates);
    };
