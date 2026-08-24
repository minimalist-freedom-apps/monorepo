import type { EvoluSchema } from '@evolu/common';
import { createStore } from '@minimalist-apps/mini-store';
import { describe, expect, test, vi } from 'vitest';
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
        const updateRelayUrls = vi.fn(() => {
            expect(store.getState().evoluRelayUrls).toEqual(['wss://free.evoluhq.com']);

            return Promise.resolve();
        });
        const setEvoluRelayUrls = createSetEvoluRelayUrls<EvoluSchema>({
            store,
            ensureEvoluStorage: async () => ({ updateRelayUrls }) as never,
        });
        const relayUrls = ['wss://one.example', 'wss://two.example'];

        await setEvoluRelayUrls(relayUrls);

        expect(updateRelayUrls).toHaveBeenCalledWith(relayUrls);
        expect(store.getState().evoluRelayUrls).toEqual(relayUrls);
    });

    test('keeps the previous setting when updating live transports fails', async () => {
        const store = createStore(initialState);
        const updateError = new Error('transport failed');
        const setEvoluRelayUrls = createSetEvoluRelayUrls<EvoluSchema>({
            store,
            ensureEvoluStorage: async () =>
                ({
                    updateRelayUrls: vi.fn().mockRejectedValue(updateError),
                }) as never,
        });

        await expect(setEvoluRelayUrls(['wss://one.example'])).rejects.toBe(updateError);
        expect(store.getState()).toEqual(initialState);
    });
});
