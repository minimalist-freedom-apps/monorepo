import { describe, expect, test } from 'vitest';
import { createAppStore } from '../createAppStore';
import type { State } from '../State';
import type { mapLocalStorageToState } from './storageMaps';

const createStateForStorage = (): State => {
    const appStore = createAppStore();
    const initialState = appStore.getState();

    return {
        ...initialState,
        rates: {
            USD: {
                code: 'USD',
                name: 'US Dollar',
                rate: 0.00001,
            },
        } as State['rates'],
        lastUpdated: 123,
        btcMode: 'sats',
        debugMode: true,
        evoluMnemonic: 'example mnemonic' as State['evoluMnemonic'],
    };
};

describe('storageMaps', () => {
    test('encodes primitives as plain strings', () => {
        const state = createStateForStorage();

        const encoded = encodeStateToStorage({ state });

        expect(encoded.lastUpdated).toBe('123');
        expect(encoded.btcMode).toBe('sats');
        expect(encoded.debugMode).toBe('true');
        expect(encoded.evoluMnemonic).toBe('example mnemonic');
        expect(encoded.rates).toBe(JSON.stringify(state.rates));
    });

    test('round-trips persisted values back to equivalent state', () => {
        const state = createStateForStorage();

        const encoded = encodeStateToStorage({ state });
        const decoded = decodeStorageToState({
            values: encoded as Record<keyof typeof mapLocalStorageToState, string>,
        });

        expect(decoded).toEqual({
            rates: state.rates,
            lastUpdated: state.lastUpdated,
            btcMode: state.btcMode,
            debugMode: state.debugMode,
            evoluMnemonic: state.evoluMnemonic,
        });
    });
});
