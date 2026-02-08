import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { AppRequirement } from '../AppRequirement';

export const configTs: AppRequirement = {
    name: 'has config.ts',
    generate: async () => [],
    verify: ({ appDir }) => {
        const configPath = join(appDir, 'config.ts');

        if (!existsSync(configPath)) {
            return ['missing config.ts'];
        }

        return [];
    },
};
