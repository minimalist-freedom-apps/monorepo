import { getOrThrow } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { asFractionalIndex } from '@minimalist-apps/fractional-indexing';
import { describe, expect, test, vi } from 'vitest';
import { createSelectedCurrenciesStore } from './createSelectedCurrenciesStore';

// biome-ignore lint/suspicious/noExplicitAny: test mocks
const asAny = <T>(value: T): any => value;

const USD = getOrThrow(CurrencyCode.fromUnknown('USD'));
const EUR = getOrThrow(CurrencyCode.fromUnknown('EUR'));

const createMockEvolu = (initialCurrency: CurrencyCode) => {
    let rows = [
        {
            id: `${initialCurrency}-id`,
            currency: initialCurrency,
            order: asFractionalIndex('a0'),
        },
    ];
    let queryListener: (() => void) | undefined;
    const evolu = {
        subscribeQuery: vi.fn(() => (listener: () => void) => {
            queryListener = listener;

            return () => {
                if (queryListener === listener) {
                    queryListener = undefined;
                }
            };
        }),
        loadQuery: vi.fn(() => Promise.resolve(rows)),
        getQueryRows: vi.fn(() => rows),
    };

    return {
        evolu,
        emitCurrency: (currency: CurrencyCode) => {
            rows = [
                {
                    id: `${currency}-id`,
                    currency,
                    order: asFractionalIndex('a0'),
                },
            ];
            queryListener?.();
        },
    };
};

describe('createSelectedCurrenciesStore', () => {
    test('defers ensureEvoluStorage call to subscribe/getState time', () => {
        const ensureEvoluStorage = vi.fn();

        createSelectedCurrenciesStore({ ensureEvoluStorage: asAny(ensureEvoluStorage) });

        expect(ensureEvoluStorage).not.toHaveBeenCalled();
    });

    test('calls ensureEvoluStorage when subscribing', () => {
        const query = Symbol('query');
        const unsubscribe = vi.fn();
        const listenerRegistrar = vi.fn(() => unsubscribe);
        const evolu = {
            createQuery: vi.fn(() => query),
            subscribeQuery: vi.fn(() => listenerRegistrar),
            loadQuery: vi.fn(() => Promise.resolve([])),
            getQueryRows: vi.fn(() => []),
        };
        const storage = {
            evolu,
            activeOwner: { id: 'owner-id' },
            subscribeOwnerChange: vi.fn(() => () => {}),
        };
        const ensureEvoluStorage = vi.fn(() => Promise.resolve(asAny(storage)));
        const selectedCurrenciesStore = createSelectedCurrenciesStore({
            ensureEvoluStorage: asAny(ensureEvoluStorage),
        });

        selectedCurrenciesStore.subscribe(vi.fn());

        expect(ensureEvoluStorage).toHaveBeenCalledOnce();
    });

    test('switches to restored owner currencies and keeps receiving their updates', async () => {
        const first = createMockEvolu(USD);
        const restored = createMockEvolu(EUR);
        const ownerChangeListeners = new Set<() => void>();
        let active = { evolu: first.evolu, ownerId: 'first-owner' };
        const storage = {
            get evolu() {
                return active.evolu;
            },
            get activeOwner() {
                return { id: active.ownerId };
            },
            subscribeOwnerChange: (listener: () => void) => {
                ownerChangeListeners.add(listener);

                return () => {
                    ownerChangeListeners.delete(listener);
                };
            },
        };
        const selectedCurrenciesStore = createSelectedCurrenciesStore({
            ensureEvoluStorage: () => Promise.resolve(asAny(storage)),
        });
        selectedCurrenciesStore.subscribe(vi.fn());
        await Promise.resolve();
        await Promise.resolve();

        expect(selectedCurrenciesStore.getState().map(currency => currency.code)).toEqual([USD]);

        active = { evolu: restored.evolu, ownerId: 'restored-owner' };

        for (const listener of ownerChangeListeners) {
            listener();
        }

        expect(selectedCurrenciesStore.getState().map(currency => currency.code)).toEqual([EUR]);

        restored.emitCurrency(USD);
        expect(selectedCurrenciesStore.getState().map(currency => currency.code)).toEqual([USD]);

        first.emitCurrency(EUR);
        expect(selectedCurrenciesStore.getState().map(currency => currency.code)).toEqual([USD]);
    });
});
