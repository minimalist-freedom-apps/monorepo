import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { getOrThrow } from '@evolu/common';
import { CurrencyCode } from '@minimalist-apps/fiat';
import { asFractionalIndex } from '@minimalist-apps/fractional-indexing';
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
        subscribeQuery: mock.fn(() => (listener: () => void) => {
            queryListener = listener;

            return () => {
                if (queryListener === listener) {
                    queryListener = undefined;
                }
            };
        }),
        loadQuery: mock.fn(() => Promise.resolve(rows)),
        getQueryRows: mock.fn(() => rows),
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
        const ensureEvoluStorage = mock.fn();

        createSelectedCurrenciesStore({ ensureEvoluStorage: asAny(ensureEvoluStorage) });

        assert.strictEqual(ensureEvoluStorage.mock.callCount(), 0);
    });

    test('calls ensureEvoluStorage when subscribing', () => {
        const query = Symbol('query');
        const unsubscribe = mock.fn();
        const listenerRegistrar = mock.fn(() => unsubscribe);
        const evolu = {
            createQuery: mock.fn(() => query),
            subscribeQuery: mock.fn(() => listenerRegistrar),
            loadQuery: mock.fn(() => Promise.resolve([])),
            getQueryRows: mock.fn(() => []),
        };
        const storage = {
            evolu,
            activeOwner: { id: 'owner-id' },
            subscribeOwnerChange: mock.fn(() => () => {}),
        };
        const ensureEvoluStorage = mock.fn(() => Promise.resolve(asAny(storage)));
        const selectedCurrenciesStore = createSelectedCurrenciesStore({
            ensureEvoluStorage: asAny(ensureEvoluStorage),
        });

        selectedCurrenciesStore.subscribe(mock.fn());

        assert.strictEqual(ensureEvoluStorage.mock.callCount(), 1);
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
        selectedCurrenciesStore.subscribe(mock.fn());
        await Promise.resolve();
        await Promise.resolve();

        assert.deepStrictEqual(
            selectedCurrenciesStore.getState().map(currency => currency.code),
            [USD],
        );

        active = { evolu: restored.evolu, ownerId: 'restored-owner' };

        for (const listener of ownerChangeListeners) {
            listener();
        }

        assert.deepStrictEqual(
            selectedCurrenciesStore.getState().map(currency => currency.code),
            [EUR],
        );

        restored.emitCurrency(USD);
        assert.deepStrictEqual(
            selectedCurrenciesStore.getState().map(currency => currency.code),
            [USD],
        );

        first.emitCurrency(EUR);
        assert.deepStrictEqual(
            selectedCurrenciesStore.getState().map(currency => currency.code),
            [USD],
        );
    });
});
