import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import type { Requirement } from '../Requirement';

const getDevPort = ({ appDir }: { readonly appDir: string }): number | null => {
    const configPath = join(appDir, 'config.ts');

    if (!existsSync(configPath)) {
        return null;
    }

    const content = readFileSync(configPath, 'utf-8');
    const match = /devPort:\s*(\d+)/u.exec(content);

    return match ? Number(match[1]) : null;
};

const buildExpectedScripts = ({
    port,
}: {
    readonly port: number;
}): ReadonlyArray<readonly [name: string, value: string | null]> => [
    ['dev', 'vite'],
    [
        'dev:android',
        `CAP_SERVER_URL=http://$(hostname -I | awk '{print $1}'):${String(port)} npx cap run android`,
    ],
    ['dev:android:sign', '../../scripts/sign-apk.sh'],
    ['build', 'vite build'],
    ['build:android', null],
    ['preview', 'vite preview'],
    ['typecheck', 'tsc --noEmit'],
    ['generate:icons', 'generate-icons'],
];

export const requiredAppScripts: Requirement = {
    name: 'has required scripts',
    applies: ({ projectType }) => projectType === 'app',
    // biome-ignore lint/suspicious/useAwait: interface requires Promise return
    fix: async ({ appDir }) => {
        const port = getDevPort({ appDir });

        if (port === null) {
            return ['missing devPort in config.ts — cannot fix scripts'];
        }

        const pkgPath = join(appDir, 'package.json');

        if (!existsSync(pkgPath)) {
            return ['missing package.json'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const existingScripts: Partial<Record<string, string>> = pkg.scripts ?? {};
        const expected = buildExpectedScripts({ port });

        const newScripts: Record<string, string> = {};

        for (const [name, value] of expected) {
            newScripts[name] = value ?? existingScripts[name] ?? '';
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

        const port = getDevPort({ appDir });

        if (port === null) {
            return ['missing devPort in config.ts — cannot verify scripts'];
        }

        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        const scripts: Record<string, string> | undefined = pkg.scripts;

        if (scripts === undefined) {
            return ['no "scripts" in package.json'];
        }

        const expected = buildExpectedScripts({ port });
        const expectedNames = expected.map(([name]) => name);
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
            for (let i = 0; i < expected.length; i++) {
                const [expectedName, expectedValue] = expected[i];

                if (scriptKeys[i] !== expectedName) {
                    errors.push(
                        `script order mismatch — expected "${expectedName}" at position ${String(i + 1)}, found "${scriptKeys[i]}"`,
                    );
                    break;
                }

                if (expectedValue !== null && scripts[expectedName] !== expectedValue) {
                    errors.push(
                        `script "${expectedName}" value mismatch — expected "${expectedValue}", found "${scripts[expectedName]}"`,
                    );
                }
            }
        }

        return errors;
    },
};
