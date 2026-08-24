import { err, getOrThrow, ok, type Run, testCreateRun } from '@evolu/common';
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

const createPendingFetchRates = () => {
    let resolve: ((rates: CurrencyMap) => void) | undefined;
    let signal: AbortSignal | undefined;
    const fetchRates: FetchRates = run => {
        signal = run.signal;

        return new Promise(resolvePromise => {
            resolve = rates => resolvePromise(ok(rates));
        });
    };

    return {
        fetchRates,
        getSignal: () => signal,
        resolve: (rates: CurrencyMap) => resolve?.(rates),
    };
};

const createSequentialFetchRates = (fetchRates: ReadonlyArray<FetchRates>): FetchRates => {
    let index = 0;

    return (run: Run) => {
        const currentFetchRates = fetchRates.at(index);
        index += 1;

        if (currentFetchRates === undefined) {
            throw new Error('Unexpected fetch rates call');
        }

        return currentFetchRates(run);
    };
};

describe(createFetchAndStoreRates.name, () => {
    test('aborts the older Fiber and keeps the newest result', async () => {
        const appStore = createAppStore();
        const older = createPendingFetchRates();
        const newer = createPendingFetchRates();
        const fetchRates = createSequentialFetchRates([older.fetchRates, newer.fetchRates]);
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

    test('handles unexpected defects and preserves the last known-good rates', async () => {
        const appStore = createAppStore();
        const existingRates = createRates(100);
        appStore.setState({ rates: existingRates, lastUpdated: 100 });
        const fetchRates: FetchRates = () => Promise.reject(new Error('unexpected failure'));
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
        expect(appStore.getState().error).toBe('Failed to fetch rates. Please try again.');
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
