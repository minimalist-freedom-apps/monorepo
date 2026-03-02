import 'disposablestack/auto';

import SharedWorkerPolyfill from '@okikio/sharedworker';

// @ts-expect-error Runtime polyfill package has no TypeScript declarations.
import promiseTry from 'promise.try';

type PromiseWithTry = PromiseConstructor & {
    try?: <T>(
        callback: (...args: ReadonlyArray<unknown>) => T | PromiseLike<T>,
        ...args: ReadonlyArray<unknown>
    ) => Promise<Awaited<T>>;
    withResolvers?: <T>() => {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: unknown) => void;
    };
};

const ensurePromiseTry = (): void => {
    const PromiseWithTry = Promise as PromiseWithTry;

    if (typeof PromiseWithTry.try === 'function') {
        return;
    }

    if (typeof promiseTry?.shim === 'function') {
        promiseTry.shim();
    }

    if (typeof PromiseWithTry.try === 'function') {
        return;
    }

    PromiseWithTry.try = <T>(
        callback: (...args: ReadonlyArray<unknown>) => T | PromiseLike<T>,
        ...args: ReadonlyArray<unknown>
    ) =>
        new Promise<Awaited<T>>((resolve, reject) => {
            try {
                resolve(callback(...args) as Awaited<T>);
            } catch (error) {
                reject(error);
            }
        });
};

export const installPolyfills = (): void => {
    if (typeof globalThis.SharedWorker === 'undefined') {
        globalThis.SharedWorker = SharedWorkerPolyfill as typeof globalThis.SharedWorker;
    }

    ensurePromiseTry();
};
