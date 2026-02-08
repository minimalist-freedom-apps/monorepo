#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateIcons } from './generateIcons.ts';

interface AppConfig {
    readonly appIconEmoji: string;
}

const configPath = resolve(process.cwd(), 'config.json');

if (!existsSync(configPath)) {
    console.error('No config.json found in', process.cwd());
    process.exit(1);
}

const config: AppConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
const appDir = process.cwd();

await generateIcons({
    emoji: config.appIconEmoji,
    webOutputDir: resolve(appDir, 'public'),
    androidResDir: existsSync(resolve(appDir, 'android/app/src/main/res'))
        ? resolve(appDir, 'android/app/src/main/res')
        : undefined,
});
