## Final Verification

After finishing implementation, run this as your **last step**:

1. **Format with Biome** — `bun run format`
2. **Auto-fix with ESLint** — `bun run lint:eslint:fix`
3. **Validate Biome lint** — `bun run lint:biome`
4. **Validate ESLint** — `bun run lint:eslint`
5. **Typecheck** — `bun run typecheck`
6. **Unit tests only** — `bun run test`
7. **Knip** — `bun run knip`

Do **not** run e2e checks as part of this final verification step.
