#!/usr/bin/env tsx

import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { AppRequirement } from './requirements/AppRequirement';
import { configTs } from './requirements/configTs/configTs';
import { generatedIcons } from './requirements/generatedIcons/generatedIcons';
import { matchingDescription } from './requirements/matchingDescription/matchingDescription';
import { requiredScripts } from './requirements/requiredScripts/requiredScripts';

// --- Requirements ---

const requirements: ReadonlyArray<AppRequirement> = [
    configTs,
    requiredScripts,
    generatedIcons,
    matchingDescription,
];

// --- Helpers ---

const getAppDirs = ({
    appsDir,
}: {
    readonly appsDir: string;
}): ReadonlyArray<string> =>
    readdirSync(appsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(appsDir, entry.name));

// --- Main ---

const workspaceRoot = resolve(process.cwd());
const appsDir = join(workspaceRoot, 'apps');
const appDirs = getAppDirs({ appsDir });

if (appDirs.length === 0) {
    console.error('No apps found in', appsDir);
    process.exit(1);
}

const errors: Array<string> = [];

for (const appDir of appDirs) {
    console.log(`\nGenerating for ${appDir}…`);

    for (const requirement of requirements) {
        const requirementErrors = await requirement.generate({ appDir });

        for (const error of requirementErrors) {
            errors.push(`${appDir} [${requirement.name}]: ${error}`);
        }
    }
}

if (errors.length > 0) {
    console.error('\nGeneration had errors:\n');

    for (const error of errors) {
        console.error(`  ✗ ${error}`);
    }

    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
}

console.log(`\n✓ Generated for ${appDirs.length} app(s).`);
