## Final Verification

After finishing implementation, run this as your **last step**:

1. **Format with Biome** — `pnpm format`
2. **Auto-fix with ESLint** — `pnpm lint:eslint:fix`
3. **Validate Biome lint** — `pnpm lint:biome`
4. **Validate ESLint** — `pnpm lint:eslint`
5. **Typecheck** — `pnpm typecheck`
6. **Unit tests only** — `pnpm test`
7. **Knip** — `pnpm knip`

Do **not** run e2e checks as part of this final verification step.
