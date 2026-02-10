import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { Requirement } from '../Requirement';

const expectedScripts: ReadonlyArray<readonly [name: string, value: string]> = [
    ['dev', 'vite'],
    ['dev:android', '../../scripts/dev-android.sh'],
    ['build', 'vite build'],
    ['build:android', '../../scripts/build-android.sh'],
    ['build:android:sign', '../../scripts/sign-apk.sh'],
    ['preview', 'vite preview'],
    ['typecheck', 'tsc --noEmit'],
];

export const requiredAppScripts: Requirement = {
    name: 'has required scripts',
    applies: ({ projectType }) => projectType === 'app',
    // biome-ignore lint/suspicious/useAwait: interface requires Promise return
    fix: async ({ appDir }) => {
        const pkgPath = join(appDir, 'package.json');

        if (!existsSync(pkgPath)) {
            return ['missing package.json'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const newScripts: Record<string, string> = {};

        for (const [name, value] of expectedScripts) {
            newScripts[name] = value;
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

        const expectedNames = expectedScripts.map(([name]) => name);
        const scriptKeys = typedObjectKeys(scripts);

        const missing = expectedNames.filter(s => !scriptKeys.includes(s));
        const extra = scriptKeys.filter(s => !expectedNames.includes(s));

        for (const name of missing) {
            errors.push(`missing script "${name}"`);
        }

        for (const name of extra) {
            errors.push(`unexpected script "${name}" (only ${expectedNames.join(', ')} allowed)`);
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
