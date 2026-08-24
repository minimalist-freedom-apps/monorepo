import { err, ok } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { RateBtcPerFiat } from '../converter/rate.js';
import {
    type CurrencyMap,
    type FetchRates,
    FetchRatesError,
    type FetchRatesOptions,
} from './FetchRates.js';
import { PositiveFiniteNumber } from './rateApiValidation.js';

interface FetchAverageRatesDeps {
    readonly fetchRates: readonly FetchRates[];
    readonly timeoutMilliseconds: number;
    readonly createAbortController: () => AbortController;
    readonly setTimeout: (listener: () => void, milliseconds: number) => TimeoutId;
    readonly clearTimeout: (timeoutId: TimeoutId) => void;
}

type FetchRatesResult = Awaited<ReturnType<FetchRates>>;
type TimeoutId = ReturnType<typeof globalThis.setTimeout>;

const settleSource = (
    deps: FetchAverageRatesDeps,
    fetchRates: FetchRates,
    options: FetchRatesOptions | undefined,
): Promise<FetchRatesResult> => {
    const abortController = deps.createAbortController();

    return new Promise<FetchRatesResult>(resolve => {
        let isSettled = false;

        const settle = (result: FetchRatesResult) => {
            if (isSettled) {
                return;
            }

            isSettled = true;
            deps.clearTimeout(timeoutId);
            options?.signal?.removeEventListener('abort', abort);
            resolve(result);
        };

        const abort = () => {
            abortController.abort();
            settle(err(FetchRatesError()));
        };

        const timeoutId = deps.setTimeout(abort, deps.timeoutMilliseconds);

        if (options?.signal !== undefined) {
            if (options.signal.aborted) {
                abort();
            } else {
                options.signal.addEventListener('abort', abort, { once: true });
            }
        }

        void Promise.resolve()
            .then(() => fetchRates({ signal: abortController.signal }))
            .then(settle, () => settle(err(FetchRatesError())));
    });
};

export const createFetchAverageRates =
    (deps: FetchAverageRatesDeps): FetchRates =>
    async options => {
        const results = await Promise.all(
            deps.fetchRates.map(fetchRates => settleSource(deps, fetchRates, options)),
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
