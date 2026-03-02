import { installPolyfills } from '@evolu/common/polyfills';
import SharedWorkerPolyfill from '@okikio/sharedworker';

// @ts-expect-error Runtime polyfill package has no TypeScript declarations.
import promiseTry from 'promise.try';

// Evolu polyfills
installPolyfills();

// Missing Evolu polyfills for Webview on Android
if (typeof globalThis.SharedWorker === 'undefined') {
    globalThis.SharedWorker = SharedWorkerPolyfill as typeof globalThis.SharedWorker;
}

promiseTry.shim();

export {
    createEnsureEvoluMnemonic,
    type EnsureEvoluMnemonic,
    type EnsureEvoluOwnerDep,
} from './createEnsureEvoluMnemonic';
export {
    createEnsureEvoluStorage,
    type EnsureEvoluStorageDep,
    type EvoluStorage,
    type OnOwnerUsedDep,
} from './createEnsureEvoluStorage';
export { createSubscribableQuery } from './createSubscribableQuery';
