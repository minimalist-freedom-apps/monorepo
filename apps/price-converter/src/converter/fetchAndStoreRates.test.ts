import { err, getOrThrow, ok } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { describe, expect, test, vi } from 'vitest';
import { type CurrencyMap, FetchRatesError } from '../rates/FetchRates';
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

const createPendingResult = () => {
    let resolve: ((result: ReturnType<typeof ok<CurrencyMap>>) => void) | undefined;
    const promise = new Promise<ReturnType<typeof ok<CurrencyMap>>>(promiseResolve => {
        resolve = promiseResolve;
    });

    return {
        promise,
        resolve: (rates: CurrencyMap) => resolve?.(ok(rates)),
    };
};

describe(createFetchAndStoreRates.name, () => {
    test('keeps the newest result when requests finish out of order', async () => {
        const appStore = createAppStore();
        const older = createPendingResult();
        const newer = createPendingResult();
        const fetchRates = vi
            .fn()
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);
        const recalculateFromBtc = vi.fn();
        const abortControllers: Array<AbortController> = [];
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates,
            recalculateFromBtc,
            currentDateTime: () => 123,
            createAbortController: () => {
                const abortController = new AbortController();
                abortControllers.push(abortController);

                return abortController;
            },
        });

        const olderRefresh = fetchAndStoreRates();
        const newerRefresh = fetchAndStoreRates();
        expect(abortControllers[0]?.signal.aborted).toBe(true);
        newer.resolve(createRates(200));
        await newerRefresh;
        older.resolve(createRates(100));
        await olderRefresh;

        expect(appStore.getState().rates[USD]?.rate).toBe(200);
        expect(appStore.getState().lastUpdated).toBe(123);
        expect(appStore.getState().loading).toBe(false);
        expect(recalculateFromBtc).toHaveBeenCalledOnce();
    });

    test('handles unexpected rejections and preserves the last known-good rates', async () => {
        const appStore = createAppStore();
        const existingRates = createRates(100);
        appStore.setState({ rates: existingRates, lastUpdated: 100 });
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates: () => Promise.reject(new Error('unexpected failure')),
            recalculateFromBtc: vi.fn(),
            currentDateTime: () => 200,
            createAbortController: () => new AbortController(),
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
        const fetchAndStoreRates = createFetchAndStoreRates({
            appStore,
            fetchRates: () => Promise.resolve(err(FetchRatesError())),
            recalculateFromBtc,
            currentDateTime: () => 200,
            createAbortController: () => new AbortController(),
        });

        await fetchAndStoreRates();

        expect(appStore.getState().rates).toBe(existingRates);
        expect(appStore.getState().lastUpdated).toBe(100);
        expect(appStore.getState().loading).toBe(false);
        expect(recalculateFromBtc).not.toHaveBeenCalled();
    });
});
