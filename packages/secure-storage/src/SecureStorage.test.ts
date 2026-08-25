import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { SecureStorage } from './SecureStorage';

type IsEqual<Left, Right> =
    (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
        ? true
        : false;

const assertType = <Value extends true>(value: Value): void => assert.strictEqual(value, true);

test('defines a platform-neutral asynchronous string storage contract', () => {
    assertType<IsEqual<Parameters<SecureStorage['load']>[0], { readonly key: string }>>(true);
    assertType<IsEqual<ReturnType<SecureStorage['load']>, Promise<string | null>>>(true);
    assertType<
        IsEqual<
            Parameters<SecureStorage['save']>[0],
            { readonly key: string; readonly value: string }
        >
    >(true);
    assertType<IsEqual<ReturnType<SecureStorage['save']>, Promise<void>>>(true);
});
