import { expectTypeOf, test } from 'vitest';
import type { SecureStorage } from './SecureStorage';

test('defines a platform-neutral asynchronous string storage contract', () => {
    expectTypeOf<Parameters<SecureStorage['load']>[0]>().toEqualTypeOf<{
        readonly key: string;
    }>();
    expectTypeOf<ReturnType<SecureStorage['load']>>().toEqualTypeOf<Promise<string | null>>();
    expectTypeOf<Parameters<SecureStorage['save']>[0]>().toEqualTypeOf<{
        readonly key: string;
        readonly value: string;
    }>();
    expectTypeOf<ReturnType<SecureStorage['save']>>().toEqualTypeOf<Promise<void>>();
});
