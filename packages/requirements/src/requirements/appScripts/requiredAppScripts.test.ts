import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { typedObjectKeys } from '@minimalist-apps/type-utils';
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
    let packageDir: string;
    let windowPackageDir: string;

    beforeEach(() => {
        appDir = createTempDir();
        packageDir = join(appDir, 'packages', 'demo-package');
        windowPackageDir = join(appDir, 'packages', 'window');
        mkdirSync(packageDir, { recursive: true });
        mkdirSync(windowPackageDir, { recursive: true });
    });

    afterEach(() => {
        rmSync(appDir, { recursive: true, force: true });
    });

    describe('fix', () => {
        test('does not apply to tsconfig package', () => {
            assert.strictEqual(
                requiredAppScripts.applies({ projectType: 'package', dirName: 'tsconfig' }),
                false,
            );
        });

        test('returns error when package.json is missing', async () => {
            const errors = await requiredAppScripts.fix({ appDir });

            assert.deepStrictEqual(errors, ['missing package.json']);
        });

        test('writes all expected scripts', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            const errors = await requiredAppScripts.fix({ appDir });

            assert.deepStrictEqual(errors, []);
            const pkg = readPackageJson({ dir: appDir });
            assert.deepStrictEqual(pkg.scripts, {
                dev: 'vite',
                'dev:android': 'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build dev',
                build: 'vite build',
                'build:android': 'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build build',
                'build:android:debug':
                    'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build build:debug',
                'build:android:sign':
                    'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build sign',
                preview: 'vite preview',
                test: 'minimalist-test',
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
            assert.strictEqual(pkg.name, '@minimalist-apps/my-app');
            assert.strictEqual(pkg.version, '2.3.1');
            assert.strictEqual(pkg.description, 'My cool app');
            assert.strictEqual(pkg.private, true);
            assert.strictEqual(pkg.type, 'module');
            assert.deepStrictEqual(pkg.dependencies, {
                react: '^19.0.0',
                'react-dom': '^19.0.0',
            });
            assert.deepStrictEqual(pkg.devDependencies, {
                typescript: '^5.3.0',
                vite: '^7.3.1',
            });
        });

        test('preserves optional scripts and removes unexpected ones', async () => {
            writePackageJson({
                dir: appDir,
                content: {
                    name: 'test-app',
                    scripts: {
                        dev: 'webpack serve',
                        e2e: 'custom-e2e-command',
                        'e2e:appium': 'custom-appium-command',
                        'custom:script': 'echo hello',
                        lint: 'eslint .',
                    },
                },
            });

            await requiredAppScripts.fix({ appDir });

            const pkg = readPackageJson({ dir: appDir });
            const scriptKeys = typedObjectKeys(pkg.scripts as Record<string, string>);
            assert.strictEqual((pkg.scripts as Record<string, string>).e2e, 'custom-e2e-command');
            assert.strictEqual(
                (pkg.scripts as Record<string, string>)['e2e:appium'],
                'custom-appium-command',
            );
            assert.ok(!scriptKeys.includes('custom:script'));
            assert.ok(!scriptKeys.includes('lint'));
        });

        test('produces valid JSON with trailing newline', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const raw = readFileSync(join(appDir, 'package.json'), 'utf-8');
            assert.strictEqual(raw.endsWith('\n'), true);
            assert.doesNotThrow(() => JSON.parse(raw));
        });

        test('uses 4-space indentation', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const raw = readFileSync(join(appDir, 'package.json'), 'utf-8');
            assert.ok(raw.includes('    "scripts"'));
        });

        test('fix result passes verify', async () => {
            writePackageJson({ dir: appDir, content: { name: 'test-app' } });

            await requiredAppScripts.fix({ appDir });

            const errors = requiredAppScripts.verify({ appDir });
            assert.deepStrictEqual(errors, []);
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
            assert.strictEqual(pkg.name, '@minimalist-apps/price-converter');
            assert.strictEqual(pkg.version, '1.0.0');
            assert.deepStrictEqual(pkg.dependencies, {
                '@capacitor/core': '^7.2.0',
                react: '^19.0.0',
                'react-dom': '^19.0.0',
            });
            assert.deepStrictEqual(pkg.devDependencies, {
                '@capacitor/android': '^7.2.0',
                '@capacitor/cli': '^7.2.0',
                typescript: '^5.3.0',
                vite: '^7.3.1',
            });

            const errors = requiredAppScripts.verify({ appDir });
            assert.deepStrictEqual(errors, []);
        });

        test('package fix enforces required test and typecheck scripts and keeps other scripts', async () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        lint: 'eslint .',
                    },
                },
            });

            const errors = await requiredAppScripts.fix({ appDir: packageDir });
            assert.deepStrictEqual(errors, []);

            const pkg = readPackageJson({ dir: packageDir });
            assert.deepStrictEqual(pkg.scripts, {
                lint: 'eslint .',
                test: 'minimalist-test',
                typecheck: 'tsc --noEmit',
            });
        });

        test('window package fix preserves the scoped Vitest timer suite', async () => {
            writePackageJson({
                dir: windowPackageDir,
                content: {
                    name: '@minimalist-apps/window',
                },
            });

            const errors = await requiredAppScripts.fix({ appDir: windowPackageDir });
            assert.deepStrictEqual(errors, []);

            const pkg = readPackageJson({ dir: windowPackageDir });
            assert.deepStrictEqual(pkg.scripts, {
                test: 'vitest run --environment=jsdom src/createWindow.spec.ts',
                typecheck: 'tsc --noEmit',
            });
        });
    });

    describe('verify', () => {
        test('app verify requires test script', () => {
            writePackageJson({
                dir: appDir,
                content: {
                    name: '@minimalist-apps/demo-app',
                    scripts: {
                        dev: 'vite',
                        'dev:android':
                            'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build dev',
                        build: 'vite build',
                        'build:android':
                            'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build build',
                        'build:android:debug':
                            'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build build:debug',
                        'build:android:sign':
                            'APP_DIR=$PWD pnpm --filter @minimalist-apps/android-build sign',
                        preview: 'vite preview',
                        typecheck: 'tsc --noEmit',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir });

            assert.deepStrictEqual(errors, ['missing script "test"']);
        });

        test('package verify requires test script', () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        typecheck: 'tsc --noEmit',
                        lint: 'eslint .',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: packageDir });
            assert.deepStrictEqual(errors, ['missing script "test"']);
        });

        test('package verify requires typecheck script', () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        test: 'minimalist-test',
                        lint: 'eslint .',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: packageDir });
            assert.deepStrictEqual(errors, ['missing script "typecheck"']);
        });

        test('package verify checks typecheck script value', () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        test: 'minimalist-test',
                        typecheck: 'tsc --pretty --noEmit',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: packageDir });
            assert.deepStrictEqual(errors, [
                'script "typecheck" value mismatch — expected "tsc --noEmit", found "tsc --pretty --noEmit"',
            ]);
        });

        test('package verify checks test script value', () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        test: 'jest',
                        typecheck: 'tsc --noEmit',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: packageDir });
            assert.deepStrictEqual(errors, [
                'script "test" value mismatch — expected "minimalist-test", found "jest"',
            ]);
        });

        test('package verify allows extra scripts when test/typecheck are correct', () => {
            writePackageJson({
                dir: packageDir,
                content: {
                    name: '@minimalist-apps/demo-package',
                    scripts: {
                        test: 'minimalist-test',
                        typecheck: 'tsc --noEmit',
                        lint: 'eslint .',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: packageDir });
            assert.deepStrictEqual(errors, []);
        });

        test('window package verify accepts the scoped Vitest timer suite', () => {
            writePackageJson({
                dir: windowPackageDir,
                content: {
                    name: '@minimalist-apps/window',
                    scripts: {
                        test: 'vitest run --environment=jsdom src/createWindow.spec.ts',
                        typecheck: 'tsc --noEmit',
                    },
                },
            });

            const errors = requiredAppScripts.verify({ appDir: windowPackageDir });
            assert.deepStrictEqual(errors, []);
        });
    });
});
