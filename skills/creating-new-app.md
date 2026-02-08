# Creating a New App

Every app lives in `apps/` and must pass `pnpm verify:apps`. Auto-fix what's possible with `pnpm generate:apps`.

## Steps

Read the implementation of the `packages/app-api/src/requirements` for details on how to implement each step.

1. **Scaffold** — create a new directory under `apps/` with Vite + React + Capacitor.
2. **Create `config.ts`** — export a typed `AppConfig` required fields.
3. **Use `appName` in `capacitor.config.ts`** 
4. **Add required scripts** to `package.json`
5. **Add `@minimalistic-apps/app-api`** as a dev dependency (`"workspace:*"`).
6. **Run `generate:apps` 
8. **Ensure `"description"` in `package.json`** matches `appDescription` from `config.ts`.


## Emoji rendering

Install Noto Color Emoji for consistent results: `sudo apt install fonts-noto-color-emoji`
