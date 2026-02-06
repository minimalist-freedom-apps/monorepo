## Pure components
Always prefer to write pure components.

## Component as Dependency
- If you need to access external dependency (global state, fetch, ...) in a component, do not use context & hooks. Instead, make component a pure render function.
- Use `connect` from `@minimalistic-apps/mini-store` to connect components to state.
- The `connect` function receives the pure component, a `mapStateToProps` function, and optionally the deps object.
- The component itself does not know about the global State type — `connect` handles the mapping.
- Components are never curried. They take `(deps, props)` as two separate arguments, or just `(props)` when there are no deps.

### Pattern: Connected component with deps

```tsx
import type { Connected } from '@minimalistic-apps/mini-store';
import type React from 'react';
import type { Mode } from '../../state/State';

type CurrencyInputOwnProps = {
    readonly value: number;
    readonly code: CurrencyCode | 'BTC';
    readonly onChange: (value: number) => void;
};

type CurrencyInputStateProps = {
    readonly mode: Mode;
    readonly focusedCurrency: CurrencyCode | 'BTC' | null;
};

type CurrencyInputDeps = {
    readonly setFocusedCurrency: (code: CurrencyCode | 'BTC') => void;
};

export type CurrencyInputDep = {
    readonly CurrencyInput: Connected<CurrencyInputOwnProps>;
};

export const InputPure = (
    deps: CurrencyInputDeps,
    { value, code, onChange, mode, focusedCurrency }: CurrencyInputStateProps & CurrencyInputOwnProps,
) => {
    // Component implementation using deps.* and props
    return <Input value={value} onChange={onChange} />;
};
```

### Pattern: Connected component without deps

```tsx
export type MnemonicSettingsStateProps = {
    readonly evoluMnemonic: string | null;
};

export const MnemonicSettingsPure = (
    { evoluMnemonic }: MnemonicSettingsStateProps,
) => (
    <Column gap={12}>
        <Mnemonic value={evoluMnemonic} />
    </Column>
);
```

### Pattern: Non-connected component (no state)

```tsx
export const SettingsScreenPure = (
    deps: SettingsScreenDeps,
) => (
    <Column gap={12}>
        <deps.ThemeSettings />
        <deps.MnemonicSettings />
    </Column>
);
```

### Wiring in compositionRoot:

```tsx
// With deps — deps are the 3rd argument to connect
const CurrencyInput = connect(
    InputPure,
    state => ({
        mode: state.mode,
        focusedCurrency: state.focusedCurrency,
    }),
    {
        setFocusedCurrency: code => store.setState({ focusedCurrency: code }),
    },
);

// Without deps — just pure function + mapStateToProps
const MnemonicSettings = connect(
    MnemonicSettingsPure,
    state => ({ evoluMnemonic: state.evoluMnemonic }),
);

// Non-connected component
const SettingsScreen = () =>
    SettingsScreenPure({ ThemeSettings, MnemonicSettings });
```

## Hooks
Do not use React hooks at all. Never. They are anti-pattern. They hide external dependencies and make code harder to test.

### Exceptions
- `useState` and `useRef` for local component state
- `useEffect` for lifecycle methods (e.g. to trigger side effects on mount/unmount)
