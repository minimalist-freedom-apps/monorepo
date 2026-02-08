#!/usr/bin/env tsx

import { readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { requireAppConfig } from './requirements/appConfig/requireAppConfig';
import { requireIcons } from './requirements/appIcons/requireIcons';
import { requiredAppScripts } from './requirements/appScripts/requiredAppScripts';
import { requireRescription } from './requirements/description/requireDescription';
import type { ProjectType, Requirement } from './requirements/Requirement';
import { requireTsconfig } from './requirements/tsconfig/requireTsconfig';

// --- Requirements ---

const requirements: ReadonlyArray<Requirement> = [
    requireAppConfig,
    requiredAppScripts,
    requireIcons,
    requireRescription,
    requireTsconfig,
];

// --- Helpers ---

const getSubDirs = ({ parentDir }: { readonly parentDir: string }): ReadonlyArray<string> =>
    readdirSync(parentDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(parentDir, entry.name));

const generateForProjects = async ({
    projectDirs,
    projectType,
}: {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
}): Promise<ReadonlyArray<string>> => {
    const errors: Array<string> = [];

    for (const dir of projectDirs) {
        const dirName = basename(dir);
        console.log(`\nGenerating for ${dir}…`);

        for (const requirement of requirements) {
            if (!requirement.applies({ projectType, dirName })) {
                continue;
            }

            const requirementErrors = await requirement.generate({ appDir: dir });

            for (const error of requirementErrors) {
                errors.push(`${dir} [${requirement.name}]: ${error}`);
            }
        }
    }

    return errors;
};

// --- Main ---

const workspaceRoot = resolve(process.cwd());
const appDirs = getSubDirs({ parentDir: join(workspaceRoot, 'apps') });
const packageDirs = getSubDirs({ parentDir: join(workspaceRoot, 'packages') });

if (appDirs.length === 0) {
    console.error('No apps found in', join(workspaceRoot, 'apps'));
    process.exit(1);
}

const errors: Array<string> = [
    ...(await generateForProjects({ projectDirs: appDirs, projectType: 'app' })),
    ...(await generateForProjects({ projectDirs: packageDirs, projectType: 'package' })),
];

if (errors.length > 0) {
    console.error('\nGeneration had errors:\n');

    for (const error of errors) {
        console.error(`  ✗ ${error}`);
    }

    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
}

console.log(`\n✓ Generated for ${appDirs.length} app(s) and ${packageDirs.length} package(s).`);
