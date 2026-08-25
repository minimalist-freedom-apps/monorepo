import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { createCapacitorSecureStorage } from './createCapacitorSecureStorage';

describe(createCapacitorSecureStorage.name, () => {
    for (const testCase of ['android', 'ios'] as const) {
        test('delegates persistence on %s' + ': ' + JSON.stringify(testCase), async () => {
            const platform = testCase;
            const nativeStorage = {
                getItem: mock.fn(async () => 'secret'),
                setItem: mock.fn(async () => undefined),
            };
            const storage = createCapacitorSecureStorage({ platform, nativeStorage });
            assert.strictEqual(await storage.load({ key: 'mnemonic' }), 'secret');
            await storage.save({ key: 'mnemonic', value: 'new-secret' });
            assert.deepStrictEqual(nativeStorage.getItem.mock.calls.at(-1)?.arguments, [
                'mnemonic',
            ]);
            assert.deepStrictEqual(nativeStorage.setItem.mock.calls.at(-1)?.arguments, [
                'mnemonic',
                'new-secret',
            ]);
        });
    }

    test('refuses the Capacitor plugin plaintext web fallback', () => {
        const nativeStorage = {
            getItem: mock.fn(async () => null),
            setItem: mock.fn(async () => undefined),
        };

        assert.throws(
            () =>
                createCapacitorSecureStorage({
                    platform: 'web',
                    nativeStorage,
                }),
            (error: unknown) =>
                error instanceof Error &&
                error.message.includes('Capacitor secure storage requires a native platform'),
        );

        assert.strictEqual(nativeStorage.getItem.mock.callCount(), 0);
        assert.strictEqual(nativeStorage.setItem.mock.callCount(), 0);
    });
});
