import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { AbortError, err, getOrThrow, ok, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { type CurrencyMap, type FetchRates, FetchRatesError } from './FetchRates.js';
import { createFetchAverageRates } from './fetchAverageRates.js';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));
const EUR = getOrThrow(CurrencyCode.fromUnknown('EUR'));
const GBP = getOrThrow(CurrencyCode.fromUnknown('GBP'));

const createMockFetchRates =
    (rates: CurrencyMap): FetchRates =>
    () =>
        ok(rates);

const createFailingFetchRates = (): FetchRates => () => err(FetchRatesError());

const createFetchAverageRatesDeps = (fetchRates: ReadonlyArray<FetchRates>) => ({
    fetchRates,
    sourceTimeout: '1s' as const,
});

describe(createFetchAverageRates.name, () => {
    test('calculates average rate from multiple sources', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
            [EUR]: { code: EUR, name: 'Euro', rate: 90 },
        } as CurrencyMap;
        const source2 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 110 },
            [EUR]: { code: EUR, name: 'Euro', rate: 100 },
        } as CurrencyMap;
        const source3 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 105 },
            [EUR]: { code: EUR, name: 'Euro', rate: 95 },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(source1),
                createMockFetchRates(source2),
                createMockFetchRates(source3),
            ]),
        );
        await using run = testCreateRun();

        const result = await run(fetchAverageRates);

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 105); // (100 + 110 + 105) / 3
        assert.strictEqual(result.value[EUR]?.rate, 95); // (90 + 100 + 95) / 3
    });

    test('calculates average when sources have different currencies', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const source2 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 200 },
            [GBP]: { code: GBP, name: 'British Pound', rate: 80 },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ]),
        );
        await using run = testCreateRun();

        const result = await run(fetchAverageRates);

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 150); // (100 + 200) / 2
        assert.strictEqual(result.value[GBP]?.rate, 80); // only one source
    });

    test('returns single source rates when only one source succeeds', async () => {
        const source = {
            [USD]: { code: USD, name: 'US Dollar', rate: 42_000 },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(source),
                createFailingFetchRates(),
                createFailingFetchRates(),
            ]),
        );
        await using run = testCreateRun();

        const result = await run(fetchAverageRates);

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 42_000);
    });

    test('returns FetchRatesError when all sources fail', async () => {
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([createFailingFetchRates(), createFailingFetchRates()]),
        );
        await using run = testCreateRun();

        assert.deepStrictEqual(await run(fetchAverageRates), {
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });

    test('preserves currency name from first available source', async () => {
        const source1 = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const source2 = {
            [USD]: {
                code: USD,
                name: 'United States Dollar',
                rate: 200,
            },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(source1),
                createMockFetchRates(source2),
            ]),
        );
        await using run = testCreateRun();

        const result = await run(fetchAverageRates);

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.name, 'US Dollar');
    });

    test('aborts a hanging source after timeout and keeps successful rates', async () => {
        let hangingSignal: AbortSignal | undefined;
        const hangingSource: FetchRates = run => {
            hangingSignal = run.signal;

            return new Promise((_resolve, reject) => {
                run.signal.addEventListener('abort', () => reject(run.signal.reason), {
                    once: true,
                });
            });
        };
        const source = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([hangingSource, createMockFetchRates(source)]),
        );
        await using run = testCreateRun();

        const resultFiber = run(fetchAverageRates);
        assert.strictEqual(hangingSignal?.aborted, false);
        run.deps.time.advance('1s');
        const result = await resultFiber;

        assert.strictEqual(hangingSignal.aborted, true);
        assert.strictEqual(result.ok, true);
        assert.strictEqual(result.value[USD]?.rate, 100);
    });

    test('propagates parent Fiber cancellation to every source', async () => {
        const sourceSignals: Array<AbortSignal> = [];
        const hangingSource: FetchRates = run => {
            sourceSignals.push(run.signal);

            return new Promise((_resolve, reject) => {
                run.signal.addEventListener('abort', () => reject(run.signal.reason), {
                    once: true,
                });
            });
        };
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([hangingSource, hangingSource]),
        );
        await using run = testCreateRun();

        const fiber = run.abortable(fetchAverageRates);
        assert.strictEqual(sourceSignals.length, 2);
        fiber.abort();
        const result = await fiber;

        assert.strictEqual(
            sourceSignals.every(signal => signal.aborted),
            true,
        );
        assert.strictEqual(result.ok, false);
        assert.strictEqual(AbortError.is(result.error), true);
    });

    test('ignores non-finite and non-positive rates before averaging', async () => {
        const invalidSource = {
            [USD]: { code: USD, name: 'US Dollar', rate: Number.NaN },
        } as CurrencyMap;
        const validSource = {
            [USD]: { code: USD, name: 'US Dollar', rate: 100 },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(invalidSource),
                createMockFetchRates(validSource),
            ]),
        );
        await using run = testCreateRun();

        const result = await run(fetchAverageRates);

        assert.strictEqual(result.ok, true);

        assert.strictEqual(result.value[USD]?.rate, 100);
    });

    test('rejects an average that overflows to a non-finite rate', async () => {
        const source = {
            [USD]: { code: USD, name: 'US Dollar', rate: Number.MAX_VALUE },
        } as CurrencyMap;
        const fetchAverageRates = createFetchAverageRates(
            createFetchAverageRatesDeps([
                createMockFetchRates(source),
                createMockFetchRates(source),
            ]),
        );
        await using run = testCreateRun();

        assert.deepStrictEqual(await run(fetchAverageRates), {
            ok: false,
            error: { type: 'FetchRatesError' },
        });
    });
});
