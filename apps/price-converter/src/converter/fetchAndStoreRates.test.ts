import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { AbortError, err, getOrThrow, ok, type Result, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { type CurrencyMap, type FetchRates, FetchRatesError } from '../rates/FetchRates';
import { createAppStore } from '../state/createAppStore';
import { createFetchAndStoreRates } from './fetchAndStoreRates';
import { asRateBtcPerFiat } from './rate';

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));

const createRates = (rate: number): CurrencyMap => ({
    [USD]: {
        code: USD,
        name: 'US Dollar',
        rate: asRateBtcPerFiat(rate),
    },
});

const createPendingRateRequest = () => {
    let resolve: ((result: Result<CurrencyMap, FetchRatesError>) => void) | undefined;
    let signal: AbortSignal | undefined;

    return {
        getSignal: () => signal,
        resolve: (rates: CurrencyMap) => resolve?.(ok(rates)),
        start: (requestSignal: AbortSignal): Promise<Result<CurrencyMap, FetchRatesError>> => {
            signal = requestSignal;

            return new Promise(resolvePromise => {
                resolve = resolvePromise;
            });
        },
    };
};

const createSequentialFetchRates = (
    requests: ReadonlyArray<ReturnType<typeof createPendingRateRequest>>,
): FetchRates => {
    let index = 0;

    return run => {
        const request = requests.at(index);
        index += 1;

        if (request === undefined) {
            throw new Error('Unexpected fetch rates call');
        }

        return request.start(run.signal);
    };
};

describe(createFetchAndStoreRates.name, () => {
    test('aborts the older Fiber and keeps the newest result', async () => {
        const appStore = createAppStore();
        const older = createPendingRateRequest();
        const newer = createPendingRateRequest();
        const fetchRates = createSequentialFetchRates([older, newer]);
        const recalculateFromBtc = mock.fn();
        await using run = testCreateRun();
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates,
            recalculateFromBtc,
            currentDateTime: () => 123,
            run,
        });

        const olderRefresh = fetchAndStoreRates();
        const newerRefresh = fetchAndStoreRates();
        assert.strictEqual(older.getSignal()?.aborted, true);
        newer.resolve(createRates(200));
        await newerRefresh;
        older.resolve(createRates(100));
        await olderRefresh;

        assert.strictEqual(appStore.getState().rates[USD]?.rate, 200);
        assert.strictEqual(appStore.getState().lastUpdated, 123);
        assert.strictEqual(appStore.getState().loading, false);
        assert.strictEqual(appStore.getState().error, '');
        assert.strictEqual(recalculateFromBtc.mock.callCount(), 1);
    });

    test('reports unexpected defects without disguising them as domain errors', async () => {
        const appStore = createAppStore();
        const existingRates = createRates(100);
        appStore.setState({ rates: existingRates, lastUpdated: 100 });
        const defect = new Error('unexpected failure');
        const fetchRates: FetchRates = () => Promise.reject(defect);
        await using run = testCreateRun();
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates,
            recalculateFromBtc: mock.fn(),
            currentDateTime: () => 200,
            run,
        });

        assert.strictEqual(await fetchAndStoreRates(), undefined);

        assert.strictEqual(appStore.getState().rates, existingRates);
        assert.strictEqual(appStore.getState().lastUpdated, 100);
        assert.strictEqual(appStore.getState().loading, false);
        assert.strictEqual(appStore.getState().error, '');

        const reportedDefect = await run.deps.reportDefect.next();
        assert.strictEqual(AbortError.is(reportedDefect), true);

        if (AbortError.is(reportedDefect)) {
            assert.strictEqual(reportedDefect.reason.type, 'PanicAbortReason');
            assert.strictEqual(reportedDefect.reason.defect, defect);
        }
    });

    test('does not turn use of a disposed Run into a fetch error', async () => {
        const appStore = createAppStore();
        const run = testCreateRun();
        await run[Symbol.asyncDispose]();
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates: () => ok(createRates(100)),
            recalculateFromBtc: mock.fn(),
            currentDateTime: () => 200,
            run,
        });

        await assert.rejects(
            fetchAndStoreRates(),
            (error: unknown) =>
                error instanceof Error && error.message.includes('Cannot use a disposed object.'),
        );

        assert.strictEqual(appStore.getState().loading, false);
        assert.strictEqual(appStore.getState().error, '');
    });

    test('preserves the last known-good rates when every source fails', async () => {
        const appStore = createAppStore();
        const existingRates = createRates(100);
        appStore.setState({ rates: existingRates, lastUpdated: 100 });
        const recalculateFromBtc = mock.fn();
        const fetchRates: FetchRates = () => err(FetchRatesError());
        await using run = testCreateRun();
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates,
            recalculateFromBtc,
            currentDateTime: () => 200,
            run,
        });

        await fetchAndStoreRates();

        assert.strictEqual(appStore.getState().rates, existingRates);
        assert.strictEqual(appStore.getState().lastUpdated, 100);
        assert.strictEqual(appStore.getState().loading, false);
        assert.strictEqual(appStore.getState().error, 'Failed to fetch rates. Please try again.');
        assert.strictEqual(recalculateFromBtc.mock.callCount(), 0);
    });
});
