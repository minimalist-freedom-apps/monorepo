## Test Selectors

### Core Rule

- In **all component tests** and **all e2e tests**, selectors MUST use only `data-testid`.
- Tests MUST interact with UI elements solely via `data-testid`.
- Tests MUST assert UI state solely via `data-testid`.

### Prohibited selectors

Do **not** use selectors based on implementation details or user-facing copy:

- `getByRole`, `queryByRole`, `findByRole`
- `getByText`, `queryByText`, `findByText`
- `getByLabelText`, `getByPlaceholderText`, `getByTitle`, etc.
- CSS selectors and classes (including design-system classes such as Ant Design `ant-*`)
- DOM structure selectors (`.parentElement`, `.closest('.some-class')`, `:nth-child`, tag selectors)

### Why

- Design-system internals and CSS class names are unstable and can change without behavior changes.
- Text-based selectors are brittle and break with copy updates or localization.
- `data-testid` gives explicit, stable, test-focused contracts.

### Required implementation pattern

- Any interactive or asserted element must expose a stable `testId`/`data-testid`.
- If a test needs to interact with something that has no `data-testid`, first add one in production code, then use it in tests.
- Prefer exporting test-id constants from the component module when reused across tests.

### Naming (mandatory)

- `data-testid` values MUST use `SCREAMING_SNAKE_CASE`.
- Exported selector constants MUST use `SCREAMING_SNAKE_CASE`.
- Example: `BTC_EASTER_EGG_MODAL_OK_BUTTON`.
