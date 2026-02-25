import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadAppConfig } from '../appConfig/loadAppConfig';
import type { Requirement } from '../Requirement';

const readPackageJson = (pkgPath: string): { description?: string } =>
    JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
        description?: string;
    };

export const requireDescription: Requirement = {
    name: 'matching description',
    applies: ({ projectType }) => projectType === 'app',
    fix: async ({ appDir }) => {
        const configPath = resolve(appDir, 'config.ts');
        const pkgPath = resolve(appDir, 'package.json');

        const configDescription = (await loadAppConfig(configPath)).appDescription;
        const pkg = readPackageJson(pkgPath);

        if (pkg.description === configDescription) {
            return [];
        }

        const nextPkg = {
            ...pkg,
            description: configDescription,
        };

        writeFileSync(pkgPath, `${JSON.stringify(nextPkg, null, 4)}\n`);

        return [];
    },
    verify: async ({ appDir }) => {
        const configPath = resolve(appDir, 'config.ts');
        const pkgPath = resolve(appDir, 'package.json');

        const pkg = readPackageJson(pkgPath);
        const pkgDescription: string | undefined = pkg.description;

        if (pkgDescription === undefined) {
            return ['missing "description" in package.json'];
        }

        const configDescription = (await loadAppConfig(configPath)).appDescription;

        if (pkgDescription !== configDescription) {
            return [
                `package.json "description" ("${pkgDescription}") does not match config.ts appDescription ("${configDescription}")`,
            ];
        }

        return [];
    },
};
