import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { Requirement } from '../Requirement';

const REQUIRED_SCRIPTS = [
    'dev',
    'dev:android',
    'build',
    'build:android',
    'preview',
    'typecheck',
    'generate:icons',
] as const;

export const requiredAppScripts: Requirement = {
    name: 'has required scripts',
    applies: ({ projectType }) => projectType === 'app',
    fix: async () => [],
    verify: ({ appDir }) => {
        const pkgPath = join(appDir, 'package.json');
        const errors: Array<string> = [];

        if (!existsSync(pkgPath)) {
            return ['missing package.json'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const scripts: Record<string, string> | undefined = pkg.scripts;

        if (scripts === undefined) {
            return ['no "scripts" in package.json'];
        }

        const scriptKeys = typedObjectKeys(scripts);

        const missing = REQUIRED_SCRIPTS.filter(s => !scriptKeys.includes(s));
        const extra = scriptKeys.filter(
            s => !REQUIRED_SCRIPTS.includes(s as (typeof REQUIRED_SCRIPTS)[number]),
        );

        for (const name of missing) {
            errors.push(`missing script "${name}"`);
        }

        for (const name of extra) {
            errors.push(
                `unexpected script "${name}" (only ${REQUIRED_SCRIPTS.join(', ')} allowed)`,
            );
        }

        if (missing.length === 0 && extra.length === 0) {
            for (let i = 0; i < REQUIRED_SCRIPTS.length; i++) {
                if (scriptKeys[i] !== REQUIRED_SCRIPTS[i]) {
                    errors.push(
                        `script order mismatch — expected "${REQUIRED_SCRIPTS[i]}" at position ${i + 1}, found "${scriptKeys[i]}"`,
                    );
                    break;
                }
            }
        }

        return errors;
    },
};
