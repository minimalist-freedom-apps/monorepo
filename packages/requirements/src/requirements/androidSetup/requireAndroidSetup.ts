import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    generateAppBuildGradle,
    generateColorsXml,
    generateStringsXml,
    generateStylesXml,
} from '@minimalist-apps/android-build';
import type { AppConfig } from '../appConfig/AppConfig';
import type { Requirement } from '../Requirement';

const getSplashPngPaths = (rootDir: string): ReadonlyArray<string> => {
    if (!existsSync(rootDir)) {
        return [];
    }

    const splashPngPaths: Array<string> = [];

    const walk = (dir: string): void => {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath = join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(entryPath);
                continue;
            }

            if (entry.isFile() && entry.name === 'splash.png') {
                splashPngPaths.push(entryPath);
            }
        }
    };

    walk(rootDir);

    return splashPngPaths;
};

export const requireAndroidSetup: Requirement = {
    name: 'android setup',
    applies: ({ projectType }) => projectType === 'app',
    fix: async ({ appDir }) => {
        const workspaceRoot = resolve(appDir, '../..');
        const templatePath = join(workspaceRoot, 'keystore.properties');

        if (!existsSync(templatePath)) {
            return [`missing ${templatePath} — create it with storeFile and keyAlias fields`];
        }

        const androidDir = join(appDir, 'android');

        if (!existsSync(androidDir)) {
            return ['android/ directory is missing (cap add android needed)'];
        }

        const configPath = resolve(appDir, 'config.ts');

        if (!existsSync(configPath)) {
            return ['missing config.ts — cannot generate Android build files'];
        }

        const { config } = (await import(pathToFileURL(configPath).href)) as {
            readonly config: AppConfig;
        };

        // Copy keystore.properties
        const keystoreTarget = join(androidDir, 'keystore.properties');
        copyFileSync(templatePath, keystoreTarget);
        console.log('  ✓ keystore.properties copied');

        // Generate app/build.gradle from shared template (version from package.json)
        const appBuildGradlePath = join(androidDir, 'app', 'build.gradle');
        writeFileSync(appBuildGradlePath, generateAppBuildGradle({ appId: config.appId }));
        console.log('  ✓ app/build.gradle generated (version from package.json)');

        // Generate strings.xml (app name from config.ts)
        const stringsDir = join(androidDir, 'app', 'src', 'main', 'res', 'values');
        mkdirSync(stringsDir, { recursive: true });
        const stringsPath = join(stringsDir, 'strings.xml');
        writeFileSync(
            stringsPath,
            generateStringsXml({ appName: config.appName, appId: config.appId }),
        );
        console.log('  ✓ strings.xml generated (app name from config.ts)');

        // Generate colors.xml (uses shared BRAND_COLOR)
        const colorsPath = join(stringsDir, 'colors.xml');
        writeFileSync(colorsPath, generateColorsXml());
        console.log('  ✓ colors.xml generated');

        // Generate styles.xml (plain-color splash screen)
        const stylesPath = join(stringsDir, 'styles.xml');
        writeFileSync(stylesPath, generateStylesXml());
        console.log('  ✓ styles.xml generated (brand-color splash screen)');

        const resDir = join(androidDir, 'app', 'src', 'main', 'res');

        for (const splashFilePath of getSplashPngPaths(resDir)) {
            rmSync(splashFilePath, { force: true });
        }

        console.log('  ✓ default Capacitor splash PNG assets removed');

        return [];
    },
    verify: ({ appDir }) => {
        const androidDir = join(appDir, 'android');
        const errors: Array<string> = [];

        if (!existsSync(androidDir)) {
            return ['android/ directory is missing'];
        }

        const requiredFiles = [
            // keystore.properties is gitignored (signing secret) — only generated locally by fix
            join('app', 'build.gradle'),
            join('app', 'src', 'main', 'res', 'values', 'strings.xml'),
            join('app', 'src', 'main', 'res', 'values', 'colors.xml'),
            join('app', 'src', 'main', 'res', 'values', 'styles.xml'),
        ] as const;

        for (const file of requiredFiles) {
            if (!existsSync(join(androidDir, file))) {
                errors.push(`missing android/${file} — run requirements-fix`);
            }
        }

        const resDir = join(androidDir, 'app', 'src', 'main', 'res');

        for (const splashFilePath of getSplashPngPaths(resDir)) {
            const androidRelativePath = relative(androidDir, splashFilePath);
            errors.push(`unexpected android/${androidRelativePath} — run requirements-fix`);
        }

        return errors;
    },
};
