import { installPolyfills as installEvoluCommonPolyfills } from '@evolu/common/polyfills';

type PromiseWithResolvers = PromiseConstructor & {
    withResolvers?: <T>() => {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: unknown) => void;
    };
};

const ensurePromiseWithResolvers = (): void => {
    const PromiseWithResolvers = Promise as PromiseWithResolvers;

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

export const installPolyfills = (): void => {
    installEvoluCommonPolyfills();
    ensurePromiseWithResolvers();
};
