# Creating a New App

Every app lives in `apps/` and must pass `pnpm requirements:verify`. Auto-fix what's possible with `pnpm requirements:fix`.

## Steps

Read the implementation of the `packages/requirements/src/requirements` for details on how to implement each step.

1. **Scaffold** — create a new directory under `apps/` with Vite + React + Capacitor.
2. **Create `config.ts`** — export a typed `AppConfig` required fields.
3. **Use `appName` in `capacitor.config.ts`** 
4. **Add required scripts** to `package.json`
5. **Add `@minimalistic-apps/requirements`** as a dev dependency (`"workspace:*"`).
6. **Run `requirements:fix` 
8. **Ensure `"description"` in `package.json`** matches `appDescription` from `config.ts`.


## Emoji rendering

Install Noto Color Emoji for consistent results: `sudo apt install fonts-noto-color-emoji`
