export const promiseWithResolversPolyfillBanner = `
if (typeof Promise.withResolvers !== 'function') {
    Object.defineProperty(Promise, 'withResolvers', {
        configurable: true,
        writable: true,
        value: function () {
            let resolve;
            let reject;
            const promise = new Promise((resolvePromise, rejectPromise) => {
                resolve = resolvePromise;
                reject = rejectPromise;
            });
            return { promise, resolve, reject };
        },
    });
}
`;
