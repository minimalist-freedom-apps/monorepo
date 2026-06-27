# Development

```bash
# Enter the Nix development shell
nix develop

# If flakes are not enabled globally
nix --extra-experimental-features nix-command --extra-experimental-features flakes develop
```

```bash
# Dev server
bun --filter @minimalist-apps/price-converter dev

# Build
bun --filter @minimalist-apps/price-converter build

# Preview production build
bun --filter @minimalist-apps/price-converter preview
