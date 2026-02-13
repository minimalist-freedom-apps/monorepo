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

### Data-provider pattern for simple tests

When tests are simple input/output assertions (no setup, no deps, single function call), use `test.each` with a data array instead of repeating test boilerplate. Keep the human-readable description as the second tuple element so it appears in test output via `%s`.

Only use this for simple tests — not for tests that need setup, mocking, or multi-step assertions.

## Test Helper Dependency Exposure

When writing test component factories/helpers:

- Do not return internally created stubs (`deps`, `onChange`, mocks) from helper return values.
- Helpers may create internal defaults for convenience, but those defaults are private implementation details.
- If a test needs to assert calls on dependencies (`onChange`, spies, injected deps), the test must create them explicitly and pass them into the helper as arguments.

## Test-driven development

- Write a failing test before implementing a new feature or fixing a bug
- Keep test code cleaner than production code — good tests let you refactor production code; nothing protects messy tests
- **MANDATORY: Every new service, function, or module MUST have a corresponding test file** — never create production code without test coverage. No exceptions.
- When creating a `createX` factory or any service, create `X.test.ts` alongside it before considering the task complete
- Untested code is unfinished code — a feature is not done until its tests exist and pass