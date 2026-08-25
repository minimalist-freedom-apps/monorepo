import type { SecureStorage } from './SecureStorage';

type IsEqual<Left, Right> =
    (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
        ? true
        : false;

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
