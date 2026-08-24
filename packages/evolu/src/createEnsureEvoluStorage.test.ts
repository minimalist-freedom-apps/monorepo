import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createEnsureEvoluStorage } from './createEnsureEvoluStorage';
import { mockEvoluStorage, TodoTestSchema } from './mockEvoluStorage';

const mnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

describe(createEnsureEvoluStorage.name, () => {
    test('reads the latest configured relays when storage is first created', async () => {
        const storage = mockEvoluStorage([]);
        const createEvoluStorage = vi.fn(() => Promise.resolve(storage));
        let relayUrls: ReadonlyArray<string> = ['wss://one.example'];
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => relayUrls,
                onOwnerUsed: vi.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        relayUrls = ['wss://two.example', 'wss://three.example'];
        await ensureEvoluStorage();

        expect(createEvoluStorage).toHaveBeenCalledWith(
            expect.objectContaining({ urls: relayUrls }),
        );
    });
});
