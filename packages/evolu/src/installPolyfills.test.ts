import { afterEach, describe, expect, it } from 'vitest';
import { installPolyfills } from './installPolyfills';

const nativeWithResolversDescriptor = Object.getOwnPropertyDescriptor(Promise, 'withResolvers');
const nativeSharedWorkerDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'SharedWorker');

afterEach(() => {
    if (nativeSharedWorkerDescriptor == null) {
        Reflect.deleteProperty(globalThis, 'SharedWorker');
    } else {
        Object.defineProperty(globalThis, 'SharedWorker', nativeSharedWorkerDescriptor);
    }

    if (nativeWithResolversDescriptor == null) {
        Reflect.deleteProperty(Promise, 'withResolvers');

        return;
    }

    Object.defineProperty(Promise, 'withResolvers', nativeWithResolversDescriptor);
});

describe(installPolyfills.name, () => {
    it('installs SharedWorker when the runtime does not provide it', () => {
        Object.defineProperty(globalThis, 'SharedWorker', {
            configurable: true,
            writable: true,
            value: undefined,
        });

        installPolyfills();

        expect(globalThis.SharedWorker).toBeTypeOf('function');
    });

    it('installs Promise.withResolvers when the runtime does not provide it', async () => {
        Object.defineProperty(Promise, 'withResolvers', {
            configurable: true,
            writable: true,
            value: undefined,
        });

        installPolyfills();

        const deferred = Promise.withResolvers<string>();
        deferred.resolve('resolved');

        await expect(deferred.promise).resolves.toBe('resolved');
    });
});
