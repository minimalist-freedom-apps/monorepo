> 👉**Looking for original price-converter? See [legacy](https://github.com/minimalist-freedom-apps/price-converter) repository.**


## Apps
- 🚧 [**Price Converter**](apps/price-converter/README.md) - Converts Fiat Shitcoins to Bitcoin/Sats
- [**Android Sync**](apps/android-sync/README.md) - Android Sync for Contacts, Calendar, and Tasks
- [**Chat**](apps/chat/README.md) - Minimalist chat app
- [**Scale Cake**](apps/scale-cake/README.md) - Scale your cake recipes to size of your plate

## Development
See: [Development](docs/development.md)

## Nix

Enter the pinned development shell before running workspace commands:

```bash
nix --extra-experimental-features nix-command --extra-experimental-features flakes develop
```

Example dev server:

```bash
bun --filter @minimalist-apps/scale-cake dev
```

## iOS Support
See: [iOS Support](docs/ios-support.md)
