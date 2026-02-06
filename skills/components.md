## Pure components
Always prefer to write pure components.

## Component as Dependency
- If you need to access external dependency (global state, fetch, ...) in a component, do not use context & hooks. Instead, make component a service.
- Use `ComponentConnectDep` from `@minimalistic-apps/mini-store` to connect components to state.
- The `connect` function is pre-configured in `compositionRoot` with the specific `mapStateToProps` - the component itself does not know about the global State type.

### Example

```tsx
import type { ComponentConnectDep } from '@minimalistic-apps/mini-store';
import type React from 'react';

type CurrencyInputOwnProps = {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
};

type CurrencyInputStateProps = {
    readonly mode: Mode;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
};

type CurrencyInputDeps = ComponentConnectDep<
    CurrencyInputStateProps,
    CurrencyInputOwnProps
> & {
    readonly setFocusedCurrency: (code: CurrencyCode | 'BTC' | null) => void;
};

type CurrencyInput = React.FC<CurrencyInputOwnProps>;

export type CurrencyInputDep = {
    readonly CurrencyInput: CurrencyInput;
};

export const createCurrencyInput = (deps: CurrencyInputDeps): CurrencyInput =>
    deps.connect(({ value, code, onChange, mode, focusedCurrency }) => {
        // Component implementation using both state props and own props
        return <Input value={value} onChange={onChange} />;
    });
```

### Wiring in compositionRoot:

```tsx
// With OwnProps - mapStateToProps receives both state and ownProps
const CurrencyInput = createCurrencyInput({
    connect: connect((state, ownProps) => ({
        mode: state.mode,
        focusedCurrency: state.focusedCurrency,
        ...ownProps,
    })),
    setFocusedCurrency: code => store.setState({ focusedCurrency: code }),
});
```

## Hooks
Do not use React hooks at all. Never. They are anti-pattern. They hide external dependencies and make code harder to test.

