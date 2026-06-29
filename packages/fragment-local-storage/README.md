# fragment-local-storage

## Combined modules

Use `createLocalStorageFragmentCompositionRoot` to combine one or more stores into one
local-storage lifecycle:

```ts
const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
    modules: [
        {
            prefix: 'app',
            store,
            mapStateLocalStorage,
            mapLocalStorageToState,
        },
    ],
    window,
});
```

Use separate prefixes when combining multiple modules:

```ts
const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
    modules: [
        {
            prefix: 'app-settings',
            store: settingsStore,
            mapStateLocalStorage: mapSettingsStateLocalStorage,
            mapLocalStorageToState: mapSettingsLocalStorageToState,
        },
        {
            prefix: 'app-game',
            store: gameStore,
            mapStateLocalStorage: mapGameStateLocalStorage,
            mapLocalStorageToState: mapGameLocalStorageToState,
        },
    ],
    window,
});
```
