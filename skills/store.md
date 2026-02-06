### Store Manipulation
Never use `deps.store.setState` directly. Always create a service for the state manipulation.

Example:

```ts
type SetTheme = (theme: Theme) => void;

type ThemeSettingsDeps = {
    readonly setTheme: SetTheme;
};
```