import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { requiredAppScripts } from './requiredAppScripts';

const createTempDir = (): string => mkdtempSync(join(tmpdir(), 'req-scripts-'));

interface WritePackageJsonProps {
    readonly dir: string;
    readonly content: Record<string, unknown>;
}

const writePackageJson = ({ dir, content }: WritePackageJsonProps): void => {
    writeFileSync(join(dir, 'package.json'), `${JSON.stringify(content, null, 4)}\n`);
};

interface ReadPackageJsonProps {
    readonly dir: string;
}

const readPackageJson = ({ dir }: ReadPackageJsonProps): Record<string, unknown> =>
    JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));

describe(requiredAppScripts.name, () => {
    let appDir: string;

    beforeEach(() => {
        appDir = createTempDir();
    });

    afterEach(() => {
        rmSync(appDir, { recursive: true, force: true });
    });

    describe('fix', () => {
        test('returns error when package.json is missing', async () => {
            const errors = await requiredAppScripts.fix({ appDir });

            expect(errors).toEqual(['missing package.json']);
        });

        test('writes all expected scripts', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            const errors = await requiredAppScripts.fix({ appDir });

            expect(errors).toEqual([]);
            const pkg = readPackageJson({ dir: appDir });
            expect(pkg.scripts).toEqual({
                dev: 'vite',
                'dev:android': '../../scripts/dev-android.sh',
                'dev:android:sign': '../../scripts/sign-apk.sh',
                build: 'vite build',
                'build:android': '../../scripts/build-android.sh',
                preview: 'vite preview',
                typecheck: 'tsc --noEmit',
            });
        });

        test('preserves other package.json fields', async () => {
            writePackageJson({
                dir: appDir,
                content: {
                    name: '@minimalist-apps/my-app',
                    version: '2.3.1',
                    description: 'My cool app',
                    private: true,
                    type: 'module',
                    dependencies: {
                        react: '^19.0.0',
                        'react-dom': '^19.0.0',
                    },
                    devDependencies: {
                        typescript: '^5.3.0',
                        vite: '^7.3.1',
                    },
                },
            });

            await requiredAppScripts.fix({ appDir });

            const pkg = readPackageJson({ dir: appDir });
            expect(pkg.name).toBe('@minimalist-apps/my-app');
            expect(pkg.version).toBe('2.3.1');
            expect(pkg.description).toBe('My cool app');
            expect(pkg.private).toBe(true);
            expect(pkg.type).toBe('module');
            expect(pkg.dependencies).toEqual({
                react: '^19.0.0',
                'react-dom': '^19.0.0',
            });
            expect(pkg.devDependencies).toEqual({
                typescript: '^5.3.0',
                vite: '^7.3.1',
            });
        });

        test('replaces existing scripts entirely', async () => {
            writePackageJson({
                dir: appDir,
                content: {
                    name: 'test-app',
                    scripts: {
                        dev: 'webpack serve',
                        'custom:script': 'echo hello',
                        lint: 'eslint .',
                    },
                },
            });

            await requiredAppScripts.fix({ appDir });

            const pkg = readPackageJson({ dir: appDir });
            const scriptKeys = typedObjectKeys(pkg.scripts as Record<string, string>);
            expect(scriptKeys).not.toContain('custom:script');
            expect(scriptKeys).not.toContain('lint');
        });

        test('produces valid JSON with trailing newline', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const raw = readFileSync(join(appDir, 'package.json'), 'utf-8');
            expect(raw.endsWith('\n')).toBe(true);
            expect(() => JSON.parse(raw)).not.toThrow();
        });

        test('uses 4-space indentation', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const raw = readFileSync(join(appDir, 'package.json'), 'utf-8');
            expect(raw).toContain('    "scripts"');
        });

        test('fix result passes verify', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const errors = requiredAppScripts.verify({ appDir });
            expect(errors).toEqual([]);
        });

        test('fix on a real-shaped package.json preserves structure', async () => {
            writePackageJson({
                dir: appDir,
                content: {
                    name: '@minimalist-apps/price-converter',
                    version: '1.0.0',
                    description: 'Minimalist Bitcoin Price Converter',
                    private: true,
                    type: 'module',
                    scripts: {
                        dev: 'old-dev-command',
                        build: 'old-build-command',
                    },
                    dependencies: {
                        '@capacitor/core': '^7.2.0',
                        react: '^19.0.0',
                        'react-dom': '^19.0.0',
                    },
                    devDependencies: {
                        '@capacitor/android': '^7.2.0',
                        '@capacitor/cli': '^7.2.0',
                        typescript: '^5.3.0',
                        vite: '^7.3.1',
                    },
                },
            });

            await requiredAppScripts.fix({ appDir });

            const pkg = readPackageJson({ dir: appDir });
            expect(pkg.name).toBe('@minimalist-apps/price-converter');
            expect(pkg.version).toBe('1.0.0');
            expect(pkg.dependencies).toEqual({
                '@capacitor/core': '^7.2.0',
                react: '^19.0.0',
                'react-dom': '^19.0.0',
            });
            expect(pkg.devDependencies).toEqual({
                '@capacitor/android': '^7.2.0',
                '@capacitor/cli': '^7.2.0',
                typescript: '^5.3.0',
                vite: '^7.3.1',
            });

            const errors = requiredAppScripts.verify({ appDir });
            expect(errors).toEqual([]);
        });
    });
});
