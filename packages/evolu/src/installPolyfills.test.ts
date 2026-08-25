import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { installPolyfills } from './installPolyfills';

const nativeWithResolversDescriptor = Object.getOwnPropertyDescriptor(Promise, 'withResolvers');

afterEach(() => {
    if (nativeWithResolversDescriptor == null) {
        Reflect.deleteProperty(Promise, 'withResolvers');

        return;
    }

    Object.defineProperty(Promise, 'withResolvers', nativeWithResolversDescriptor);
});

describe(installPolyfills.name, () => {
    it('installs Promise.withResolvers when the runtime does not provide it', async () => {
        Object.defineProperty(Promise, 'withResolvers', {
            configurable: true,
            writable: true,
            value: undefined,
        });

        installPolyfills();

        const deferred = Promise.withResolvers<string>();
        deferred.resolve('resolved');

        assert.strictEqual(await deferred.promise, 'resolved');
    });
});
