import type { IsEqual } from '@minimalist-apps/type-utils';
import type { SecureStorage } from './SecureStorage';

type Assert<Value extends true> = Value;

// SecureStorage is a type-only contract, so these assertions are verified by TypeScript.
export interface SecureStorageContractAssertions {
    readonly loadProps: Assert<
        IsEqual<Parameters<SecureStorage['load']>[0], { readonly key: string }>
    >;
    readonly loadResult: Assert<IsEqual<ReturnType<SecureStorage['load']>, Promise<string | null>>>;
    readonly saveProps: Assert<
        IsEqual<
            Parameters<SecureStorage['save']>[0],
            { readonly key: string; readonly value: string }
        >
    >;
    readonly saveResult: Assert<IsEqual<ReturnType<SecureStorage['save']>, Promise<void>>>;
}
