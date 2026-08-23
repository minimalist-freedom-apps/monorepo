import { installPolyfills as installEvoluCommonPolyfills } from '@evolu/common/polyfills';

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

const ensurePromiseWithResolvers = (): void => {
    const PromiseWithResolvers = Promise as PromiseWithTry;

    if (typeof PromiseWithResolvers.withResolvers === 'function') {
        return;
    }

    PromiseWithResolvers.withResolvers = <T>() => {
        let resolvePromise!: (value: T | PromiseLike<T>) => void;
        let rejectPromise!: (reason?: unknown) => void;
        const promise = new Promise<T>((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });

        return {
            promise,
            resolve: resolvePromise,
            reject: rejectPromise,
        };
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

    const promiseTryImpl = (<T, U extends unknown[]>(
        callbackFn: (...args: U) => T | PromiseLike<T>,
        ...args: U
    ) =>
        new Promise<Awaited<T>>((resolve, reject) => {
            try {
                resolve(callbackFn(...args) as Awaited<T>);
            } catch (error) {
                reject(error);
            }
        })) as NonNullable<PromiseWithTry['try']>;

    PromiseWithTry.try = promiseTryImpl;
};

export const installPolyfills = (): void => {
    installEvoluCommonPolyfills();
    ensurePromiseWithResolvers();
    ensurePromiseTry();
};
