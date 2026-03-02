import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { Requirement } from '../Requirement';

const expectedScripts: ReadonlyArray<readonly [name: string, value: string]> = [
    ['dev', 'vite'],
    ['dev:android', 'APP_DIR=$PWD bun run --filter @minimalist-apps/android-build dev'],
    ['build', 'vite build'],
    ['build:android', 'APP_DIR=$PWD bun run --filter @minimalist-apps/android-build build'],
    [
        'build:android:debug',
        'APP_DIR=$PWD bun run --filter @minimalist-apps/android-build build:debug',
    ],
    ['build:android:sign', 'APP_DIR=$PWD bun run --filter @minimalist-apps/android-build sign'],
    ['preview', 'vite preview'],
    ['typecheck', 'tsc --noEmit'],
];

const optionalAllowedScriptNames = ['e2e', 'e2e-ci', 'e2e:appium', 'e2e:emulator'] as const;

const requiredPackageScripts = ['typecheck', 'tsc --noEmit'] as const;

const isPackageDir = (dirPath: string): boolean => {
    const pathSegments = dirPath.split(sep);

    return pathSegments.includes('packages');
};

export const requiredAppScripts: Requirement = {
    name: 'has required scripts',
    applies: () => true,
    // biome-ignore lint/suspicious/useAwait: interface requires Promise return
    fix: async ({ appDir }) => {
        const pkgPath = join(appDir, 'package.json');

        if (!existsSync(pkgPath)) {
            return ['missing package.json'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const existingScripts = (pkg.scripts ?? {}) as Record<string, string>;

        if (isPackageDir(appDir)) {
            pkg.scripts = {
                ...existingScripts,
                [requiredPackageScripts[0]]: requiredPackageScripts[1],
            };
            writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);

            return [];
        }

        const newScripts: Record<string, string> = {};

        for (const [name, value] of expectedScripts) {
            newScripts[name] = value;
        }

        for (const name of optionalAllowedScriptNames) {
            const existingValue = existingScripts[name];

            if (typeof existingValue === 'string') {
                newScripts[name] = existingValue;
            }
        }

        pkg.scripts = newScripts;
        writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);

        return [];
    },
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

        if (isPackageDir(appDir)) {
            const [scriptName, scriptValue] = requiredPackageScripts;

            if (!(scriptName in scripts)) {
                return [`missing script "${scriptName}"`];
            }

            if (scripts[scriptName] !== scriptValue) {
                return [
                    `script "${scriptName}" value mismatch — expected "${scriptValue}", found "${scripts[scriptName]}"`,
                ];
            }

            return [];
        }

        const expectedNames = expectedScripts.map(([name]) => name);
        const scriptKeys = typedObjectKeys(scripts);

        const missing = expectedNames.filter(s => !scriptKeys.includes(s));
        const extra = scriptKeys.filter(
            s =>
                !expectedNames.includes(s) &&
                !(optionalAllowedScriptNames as ReadonlyArray<string>).includes(s),
        );

        for (const name of missing) {
            errors.push(`missing script "${name}"`);
        }

        for (const name of extra) {
            errors.push(
                `unexpected script "${name}" (only ${[...expectedNames, ...optionalAllowedScriptNames].join(', ')} allowed)`,
            );
        }

        if (missing.length === 0 && extra.length === 0) {
            for (let i = 0; i < expectedScripts.length; i++) {
                const [expectedName, expectedValue] = expectedScripts[i];

                if (scriptKeys[i] !== expectedName) {
                    errors.push(
                        `script order mismatch — expected "${expectedName}" at position ${String(i + 1)}, found "${scriptKeys[i]}"`,
                    );
                    break;
                }

                if (scripts[expectedName] !== expectedValue) {
                    errors.push(
                        `script "${expectedName}" value mismatch — expected "${expectedValue}", found "${scripts[expectedName]}"`,
                    );
                }
            }
        }

        return errors;
    },
};
