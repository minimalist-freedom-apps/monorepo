import { execSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Requirement } from '../Requirement';

export const requireAndroidSetup: Requirement = {
    name: 'android setup',
    applies: ({ projectType }) => projectType === 'app',
    // biome-ignore lint/suspicious/useAwait: interface requires Promise return
    fix: async ({ appDir }) => {
        const workspaceRoot = resolve(appDir, '../..');
        const templatePath = join(workspaceRoot, 'keystore.properties');

        if (!existsSync(templatePath)) {
            return [`missing ${templatePath} — create it with storeFile and keyAlias fields`];
        }

        const androidDir = join(appDir, 'android');

        if (!existsSync(androidDir)) {
            console.log('  Adding android platform…');

            try {
                execSync('npx cap add android', { cwd: appDir, stdio: 'inherit' });
            } catch {
                return ['cap add android failed — check output above'];
            }
        }

        if (!existsSync(androidDir)) {
            return ['android/ directory still missing after cap add'];
        }

        console.log('  Android build configuration: using committed Gradle files (no script run)');

        const targetPath = join(androidDir, 'keystore.properties');

        copyFileSync(templatePath, targetPath);
        console.log('  ✓ keystore.properties copied');

        return [];
    },
    verify: () => [],
};
