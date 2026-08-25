import type { IsEqual } from './isEqual.js';

type AssertTrue<Value extends true> = Value;
type AssertFalse<Value extends false> = Value;

export interface IsEqualContractAssertions {
    readonly identicalTypes: AssertTrue<
        IsEqual<{ readonly value: string }, { readonly value: string }>
    >;
    readonly differentTypes: AssertFalse<IsEqual<string, number>>;
    readonly assignableButNotEqualTypes: AssertFalse<IsEqual<'value', string>>;
}
