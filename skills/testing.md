## Testing

- **Create deps per test** - use `createTestDeps()` from `@evolu/common` for test isolation
- **Naming convention** - test factories follow `testCreateX` pattern (e.g., `testCreateTime`, `testCreateRandom`)
- Mock dependencies using the same interfaces
- Never rely on global state or shared mutable deps between tests

### Describe
If you test function, use `function.name` to reference it, to make renaming easier:

```ts
describe(calculateCircle.name, () => {}
```

### Test deps pattern

Create fresh deps at the start of each test for isolation. Each call creates independent instances, preventing shared state between tests.

```ts
import { createTestDeps, createId } from '@evolu/common';

test('creates unique IDs', () => {
    const deps = createTestDeps();
    const id1 = createId(deps);
    const id2 = createId(deps);
    expect(id1).not.toBe(id2);
});

test('with custom seed for reproducibility', () => {
    const deps = createTestDeps({ seed: 'my-test' });
    const id = createId(deps);
    expect(id).toMatchInlineSnapshot(`"..."`);
});
```

### Test factories naming

Test-specific factories use `testCreateX` prefix to distinguish from production `createX`:

```ts
// Production factory
export const createTime = (): Time => ({ now: () => Date.now() });

// Test factory with controllable time
export const testCreateTime = (options?: {
  readonly startAt?: Millis;
  readonly autoIncrement?: boolean;
}): TestTime => { ... };
```

### Vitest filtering (https://vitest.dev/guide/filtering)

```bash
# Run all tests in a package
pnpm test --filter @evolu/common

# Run a single file
pnpm test --filter @evolu/common -- Task

# Run a single test by name (-t flag)
pnpm test --filter @evolu/common -- -t "yields and returns ok"
```