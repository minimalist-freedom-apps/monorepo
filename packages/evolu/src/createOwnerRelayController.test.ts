import type { Evolu, Owner } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createOwnerRelayController } from './createOwnerRelayController';
import type { TodoTestSchema } from './mockEvoluStorage';

const owner = {
    id: 'test-owner-id',
} as Owner;

describe(createOwnerRelayController.name, () => {
    test('switches to all new relays before releasing the previous relays', () => {
        const events: Array<string> = [];
        const releaseFirst = vi.fn(() => events.push('release-first'));
        const releaseSecond = vi.fn(() => events.push('release-second'));
        const useOwner = vi
            .fn()
            .mockImplementationOnce(() => {
                events.push('use-first');

                return releaseFirst;
            })
            .mockImplementationOnce(() => {
                events.push('use-second');

                return releaseSecond;
            });
        const controller = createOwnerRelayController({
            evolu: { useOwner } as unknown as Evolu<TodoTestSchema>,
            owner,
        });

        controller.updateRelayUrls(['wss://one.example', 'wss://two.example']);
        controller.updateRelayUrls(['wss://three.example']);

        expect(useOwner).toHaveBeenNthCalledWith(1, owner, [
            { type: 'WebSocket', url: 'wss://one.example?ownerId=test-owner-id' },
            { type: 'WebSocket', url: 'wss://two.example?ownerId=test-owner-id' },
        ]);
        expect(useOwner).toHaveBeenNthCalledWith(2, owner, [
            { type: 'WebSocket', url: 'wss://three.example?ownerId=test-owner-id' },
        ]);
        expect(events).toEqual(['use-first', 'use-second', 'release-first']);
        expect(releaseSecond).not.toHaveBeenCalled();
    });

    test('releases active relays when given an empty list', () => {
        const release = vi.fn();
        const useOwner = vi.fn(() => release);
        const controller = createOwnerRelayController({
            evolu: { useOwner } as unknown as Evolu<TodoTestSchema>,
            owner,
        });

        controller.updateRelayUrls(['wss://one.example']);
        controller.updateRelayUrls([]);

        expect(release).toHaveBeenCalledOnce();
        expect(useOwner).toHaveBeenCalledOnce();
    });
});
