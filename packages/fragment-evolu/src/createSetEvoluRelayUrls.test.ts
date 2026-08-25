import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import type { EvoluSchema } from '@evolu/common';
import { createStore } from '@minimalist-apps/mini-store';
import { createSetEvoluRelayUrls } from './createSetEvoluRelayUrls';
import type { EvoluState } from './evoluState';

const initialState: EvoluState = {
    evoluMnemonic: null,
    activeOwnerAppId: null,
    evoluRelayUrls: ['wss://free.evoluhq.com'],
};

describe(createSetEvoluRelayUrls.name, () => {
    test('updates live transports before publishing the new setting', async () => {
        const store = createStore(initialState);
        const updateRelayUrls = mock.fn(() => {
            assert.deepStrictEqual(store.getState().evoluRelayUrls, ['wss://free.evoluhq.com']);

            return Promise.resolve();
        });
        const setEvoluRelayUrls = createSetEvoluRelayUrls<EvoluSchema>({
            store,
            ensureEvoluStorage: async () => ({ updateRelayUrls }) as never,
        });
        const relayUrls = ['wss://one.example', 'wss://two.example'];

        await setEvoluRelayUrls(relayUrls);

        assert.deepStrictEqual(updateRelayUrls.mock.calls.at(-1)?.arguments, [relayUrls]);
        assert.deepStrictEqual(store.getState().evoluRelayUrls, relayUrls);
    });

    test('keeps the previous setting when updating live transports fails', async () => {
        const store = createStore(initialState);
        const updateError = new Error('transport failed');
        const setEvoluRelayUrls = createSetEvoluRelayUrls<EvoluSchema>({
            store,
            ensureEvoluStorage: async () =>
                ({
                    updateRelayUrls: mock.fn(() => Promise.reject(updateError)),
                }) as never,
        });

        await assert.rejects(setEvoluRelayUrls(['wss://one.example']), (error: unknown) => {
            assert.strictEqual(error, updateError);

            return true;
        });
        assert.deepStrictEqual(store.getState(), initialState);
    });
});
