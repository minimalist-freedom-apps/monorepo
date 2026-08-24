import { AbortError, err, getOrThrow, ok, type Result, testCreateRun } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test, vi } from 'vitest';
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
        const recalculateFromBtc = vi.fn();
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
        expect(older.getSignal()?.aborted).toBe(true);
        newer.resolve(createRates(200));
        await newerRefresh;
        older.resolve(createRates(100));
        await olderRefresh;

        expect(appStore.getState().rates[USD]?.rate).toBe(200);
        expect(appStore.getState().lastUpdated).toBe(123);
        expect(appStore.getState().loading).toBe(false);
        expect(appStore.getState().error).toBe('');
        expect(recalculateFromBtc).toHaveBeenCalledOnce();
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
            recalculateFromBtc: vi.fn(),
            currentDateTime: () => 200,
            run,
        });

        await expect(fetchAndStoreRates()).resolves.toBeUndefined();

        expect(appStore.getState().rates).toBe(existingRates);
        expect(appStore.getState().lastUpdated).toBe(100);
        expect(appStore.getState().loading).toBe(false);
        expect(appStore.getState().error).toBe('');

        const reportedDefect = await run.deps.reportDefect.next();
        expect(AbortError.is(reportedDefect)).toBe(true);

        if (AbortError.is(reportedDefect)) {
            expect(reportedDefect.reason.type).toBe('PanicAbortReason');

            if (reportedDefect.reason.type === 'PanicAbortReason') {
                expect(reportedDefect.reason.defect).toBe(defect);
            }
        }
    });

    test('does not turn use of a disposed Run into a fetch error', async () => {
        const appStore = createAppStore();
        const run = testCreateRun();
        await run[Symbol.asyncDispose]();
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates: () => ok(createRates(100)),
            recalculateFromBtc: vi.fn(),
            currentDateTime: () => 200,
            run,
        });

        await expect(fetchAndStoreRates()).rejects.toThrow('Cannot use a disposed object.');

        expect(appStore.getState().loading).toBe(false);
        expect(appStore.getState().error).toBe('');
    });

    test('preserves the last known-good rates when every source fails', async () => {
        const appStore = createAppStore();
        const existingRates = createRates(100);
        appStore.setState({ rates: existingRates, lastUpdated: 100 });
        const recalculateFromBtc = vi.fn();
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

        expect(appStore.getState().rates).toBe(existingRates);
        expect(appStore.getState().lastUpdated).toBe(100);
        expect(appStore.getState().loading).toBe(false);
        expect(appStore.getState().error).toBe('Failed to fetch rates. Please try again.');
        expect(recalculateFromBtc).not.toHaveBeenCalled();
    });
});
