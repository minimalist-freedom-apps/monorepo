import { installPolyfills as installEvoluCommonPolyfills } from '@evolu/common/polyfills';

// cspell:ignore okikio
import SharedWorkerPolyfill from '@okikio/sharedworker';

// @ts-expect-error Runtime polyfill package has no TypeScript declarations.
import promiseTry from 'promise.try';

export const installPolyfills = (): void => {
    installEvoluCommonPolyfills();

    if (typeof globalThis.SharedWorker === 'undefined') {
        globalThis.SharedWorker = SharedWorkerPolyfill as typeof globalThis.SharedWorker;
    }

    promiseTry.shim();
};
