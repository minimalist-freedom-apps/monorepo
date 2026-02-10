# Android Build

## Never edit generated Android files directly

Check the files in the `@minimalist-apps/android-build` package and those must not be edited by hand in the `apps/*/android/` directories.

## How to make changes

1. Edit the **template** or **generator** in `packages/android-build/src/` (templates live in `packages/android-build/src/templates/`).
2. Run `pnpm requirements:fix` to regenerate the files for all apps.
3. Verify with `pnpm requirements:verify`.

## How it works

- `packages/android-build` exports generator functions (e.g. `generateAppBuildGradle`) that read Handlebars-style templates and inject per-app variables like `{{appId}}`.
- `packages/requirements` calls these generators in `requireAndroidSetup` and writes the output into each app's `android/` directory.
- This ensures every app gets an identical, up-to-date build configuration from a single source of truth.
