import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { Mnemonic } from '@evolu/common';
import { createStore } from '@minimalist-apps/mini-store';
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

        assert.strictEqual(statesDuringSave[0]?.evoluMnemonic, null);
        assert.strictEqual(store.getState().evoluMnemonic, mnemonic);
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

        await assert.rejects(
            setEvoluMnemonic(mnemonic),
            (error: unknown) => error instanceof Error && error.message.includes('write failed'),
        );
        assert.strictEqual(store.getState().evoluMnemonic, null);
    });
});
