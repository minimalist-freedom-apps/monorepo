import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Requirement } from '../Requirement';

export const requireDescription: Requirement = {
    name: 'matching description',
    applies: ({ projectType }) => projectType === 'app',
    generate: async () => [],
    verify: ({ appDir }) => {
        const configPath = resolve(appDir, 'config.ts');
        const pkgPath = resolve(appDir, 'package.json');

        if (!existsSync(configPath)) {
            return ['missing config.ts — cannot verify description'];
        }

        if (!existsSync(pkgPath)) {
            return ['missing package.json — cannot verify description'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const pkgDescription: string | undefined = pkg.description;

        if (pkgDescription === undefined) {
            return ['missing "description" in package.json'];
        }

        const configContent = readFileSync(configPath, 'utf-8');
        const match = /appDescription:\s*['"](.+?)['"]/u.exec(configContent);

        if (match === null) {
            return ['could not find appDescription in config.ts'];
        }

        const configDescription = match[1];

        if (pkgDescription !== configDescription) {
            return [
                `package.json "description" ("${pkgDescription}") does not match config.ts appDescription ("${configDescription}")`,
            ];
        }

        return [];
    },
};
