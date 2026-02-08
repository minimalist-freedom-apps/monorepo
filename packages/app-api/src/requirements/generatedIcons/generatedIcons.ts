import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AppConfig } from '../../AppConfig';
import type { AppRequirement } from '../AppRequirement';
import { generateIcons } from './generateIcons';

const REQUIRED_ICONS = ['favicon.png', 'icon-192x192.png', 'icon-512x512.png'] as const;

export const generatedIcons: AppRequirement = {
    name: 'has generated icons',
    generate: async ({ appDir }) => {
        const configPath = resolve(appDir, 'config.ts');

        if (!existsSync(configPath)) {
            return ['missing config.ts — cannot generate icons'];
        }

        const { config }: { readonly config: AppConfig } = await import(
            pathToFileURL(configPath).href
        );

        await generateIcons({
            emoji: config.appIconEmoji,
            webOutputDir: resolve(appDir, 'public'),
            androidResDir: existsSync(resolve(appDir, 'android/app/src/main/res'))
                ? resolve(appDir, 'android/app/src/main/res')
                : undefined,
        });

        return [];
    },
    verify: ({ appDir }) => {
        const publicDir = resolve(appDir, 'public');
        const errors: Array<string> = [];

        if (!existsSync(publicDir)) {
            return ['missing public/ folder — run "generate:icons" first'];
        }

        for (const icon of REQUIRED_ICONS) {
            if (!existsSync(resolve(publicDir, icon))) {
                errors.push(`missing public/${icon} — run "generate:icons" first`);
            }
        }

        return errors;
    },
};
