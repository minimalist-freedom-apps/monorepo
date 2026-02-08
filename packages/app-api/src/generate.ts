#!/usr/bin/env tsx

import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { AppRequirement } from './requirements/AppRequirement';
import { configTs } from './requirements/configTs/configTs';
import { generatedIcons } from './requirements/generatedIcons/generatedIcons';
import { matchingDescription } from './requirements/matchingDescription/matchingDescription';
import { requiredScripts } from './requirements/requiredScripts/requiredScripts';
import { tsconfigExtends } from './requirements/tsconfigExtends/tsconfigExtends';

// --- Requirements ---

const TSCONFIG_PACKAGE_NAME = 'tsconfig';

const appRequirements: ReadonlyArray<AppRequirement> = [
    configTs,
    requiredScripts,
    generatedIcons,
    matchingDescription,
];

const projectRequirements: ReadonlyArray<AppRequirement> = [tsconfigExtends];

// --- Helpers ---

const getSubDirs = ({ parentDir }: { readonly parentDir: string }): ReadonlyArray<string> =>
    readdirSync(parentDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(parentDir, entry.name));

// --- Main ---

const workspaceRoot = resolve(process.cwd());
const appsDir = join(workspaceRoot, 'apps');
const packagesDir = join(workspaceRoot, 'packages');
const appDirs = getSubDirs({ parentDir: appsDir });
const packageDirs = getSubDirs({ parentDir: packagesDir }).filter(
    dir => !dir.endsWith(`/${TSCONFIG_PACKAGE_NAME}`),
);

if (appDirs.length === 0) {
    console.error('No apps found in', appsDir);
    process.exit(1);
}

const errors: Array<string> = [];

for (const appDir of appDirs) {
    console.log(`\nGenerating for ${appDir}…`);

    for (const requirement of [...appRequirements, ...projectRequirements]) {
        const requirementErrors = await requirement.generate({ appDir });

        for (const error of requirementErrors) {
            errors.push(`${appDir} [${requirement.name}]: ${error}`);
        }
    }
}

for (const packageDir of packageDirs) {
    console.log(`\nGenerating for ${packageDir}…`);

    for (const requirement of projectRequirements) {
        const requirementErrors = await requirement.generate({ appDir: packageDir });

        for (const error of requirementErrors) {
            errors.push(`${packageDir} [${requirement.name}]: ${error}`);
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

console.log(`\n✓ Generated for ${appDirs.length} app(s) and ${packageDirs.length} package(s).`);
