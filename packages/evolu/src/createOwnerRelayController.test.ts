import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import type { Evolu, Owner } from '@evolu/common';
import { createOwnerRelayController } from './createOwnerRelayController';
import type { TodoTestSchema } from './mockEvoluStorage';

const owner = {
    id: 'test-owner-id',
} as Owner;

describe(createOwnerRelayController.name, () => {
    test('switches to all new relays before releasing the previous relays', () => {
        const events: Array<string> = [];
        const releaseFirst = mock.fn(() => events.push('release-first'));
        const releaseSecond = mock.fn(() => events.push('release-second'));
        const useOwner = mock.fn(() => {
            events.push('use-second');

            return releaseSecond;
        });
        useOwner.mock.mockImplementationOnce(() => {
            events.push('use-first');

            return releaseFirst;
        });
        const controller = createOwnerRelayController({
            evolu: { useOwner } as unknown as Evolu<TodoTestSchema>,
            owner,
        });

        controller.updateRelayUrls(['wss://one.example', 'wss://two.example']);
        controller.updateRelayUrls(['wss://three.example']);

        assert.deepStrictEqual(useOwner.mock.calls[1 - 1]?.arguments, [
            owner,
            [
                { type: 'WebSocket', url: 'wss://one.example?ownerId=test-owner-id' },
                { type: 'WebSocket', url: 'wss://two.example?ownerId=test-owner-id' },
            ],
        ]);
        assert.deepStrictEqual(useOwner.mock.calls[2 - 1]?.arguments, [
            owner,
            [{ type: 'WebSocket', url: 'wss://three.example?ownerId=test-owner-id' }],
        ]);
        assert.deepStrictEqual(events, ['use-first', 'use-second', 'release-first']);
        assert.strictEqual(releaseSecond.mock.callCount(), 0);
    });

    test('releases active relays when given an empty list', () => {
        const release = mock.fn();
        const useOwner = mock.fn(() => release);
        const controller = createOwnerRelayController({
            evolu: { useOwner } as unknown as Evolu<TodoTestSchema>,
            owner,
        });

        controller.updateRelayUrls(['wss://one.example']);
        controller.updateRelayUrls([]);

        assert.strictEqual(release.mock.callCount(), 1);
        assert.strictEqual(useOwner.mock.callCount(), 1);
    });
});
