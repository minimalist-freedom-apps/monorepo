# fragment-local-storage

## Combined modules

Use `createLocalStorageModule` with `createLocalStorageFragmentCompositionRoot` to combine
multiple stores into one local-storage lifecycle:

```ts
const { localStorageInit } = createLocalStorageFragmentCompositionRoot({
    prefix: 'app',
    modules: [
        createLocalStorageModule({
            key: 'settings',
            store: settingsStore,
            mapStateLocalStorage: mapSettingsStateLocalStorage,
            mapLocalStorageToState: mapSettingsLocalStorageToState,
        }),
        createLocalStorageModule({
            key: 'game',
            store: gameStore,
            mapStateLocalStorage: mapGameStateLocalStorage,
            mapLocalStorageToState: mapGameLocalStorageToState,
        }),
    ],
    window,
});
```
