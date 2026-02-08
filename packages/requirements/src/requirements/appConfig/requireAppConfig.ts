import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Requirement } from '../Requirement';

export const requireAppConfig: Requirement = {
    name: 'has config.ts',
    applies: ({ projectType }) => projectType === 'app',
    generate: async () => [],
    verify: ({ appDir }) => {
        const configPath = join(appDir, 'config.ts');

        if (!existsSync(configPath)) {
            return ['missing config.ts'];
        }

        return [];
    },
};
