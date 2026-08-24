import { Mnemonic } from '@evolu/common';
import { createStore } from '@minimalist-apps/mini-store';
import { describe, expect, test } from 'vitest';
import { createSetEvoluMnemonic } from './createSetEvoluMnemonic';
import type { EvoluState } from './evoluState';

const mnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

const createEvoluStore = () =>
    createStore<EvoluState>({
        evoluMnemonic: null,
        activeOwnerAppId: null,
        evoluRelayUrls: ['wss://free.evoluhq.com'],
    });

describe(createSetEvoluMnemonic.name, () => {
    test('updates state only after secure persistence succeeds', async () => {
        const store = createEvoluStore();
        const statesDuringSave: Array<EvoluState> = [];
        const setEvoluMnemonic = createSetEvoluMnemonic({
            store,
            evoluMnemonicStorage: {
                load: async () => null,
                save: () => {
                    statesDuringSave.push(store.getState());

                    return Promise.resolve();
                },
            },
        });

        await setEvoluMnemonic(mnemonic);

        expect(statesDuringSave[0]?.evoluMnemonic).toBeNull();
        expect(store.getState().evoluMnemonic).toBe(mnemonic);
    });

    test('does not update state when secure persistence fails', async () => {
        const store = createEvoluStore();
        const setEvoluMnemonic = createSetEvoluMnemonic({
            store,
            evoluMnemonicStorage: {
                load: async () => null,
                save: () => Promise.reject(new Error('write failed')),
            },
        });

        await expect(setEvoluMnemonic(mnemonic)).rejects.toThrow('write failed');
        expect(store.getState().evoluMnemonic).toBeNull();
    });
});
