#!/usr/bin/env tsx

import { basename, join, resolve } from 'node:path';
import { filterByName, filterDirs, getSubDirs, green, parseArgs, red } from '@minimalist-apps/cli';
import { requirements } from './allRequirements';
import type { ProjectType } from './requirements/Requirement';

// --- Helpers ---

interface FixProjectsProps {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
    readonly filteredRequirements: ReadonlyArray<(typeof requirements)[number]>;
}

const fixProjects = async ({
    projectDirs,
    projectType,
    filteredRequirements,
}: FixProjectsProps): Promise<ReadonlyArray<string>> => {
    const errors: Array<string> = [];

    for (const dir of projectDirs) {
        const dirName = basename(dir);
        console.log(`\nFixing ${dir}…`);

        for (const requirement of filteredRequirements) {
            if (!requirement.applies({ projectType, dirName })) {
                continue;
            }

            const requirementErrors = await requirement.fix({ appDir: dir });

            for (const error of requirementErrors) {
                errors.push(`${dir} [${requirement.name}]: ${error}`);
            }
        }
    }

    return errors;
};

// --- Main ---

const workspaceRoot = resolve(process.cwd());
const { filter, only } = parseArgs(process.argv);
const appDirs = filterDirs({
    dirs: getSubDirs({ parentDir: join(workspaceRoot, 'apps') }),
    filter,
});
const packageDirs = filterDirs({
    dirs: getSubDirs({ parentDir: join(workspaceRoot, 'packages') }),
    filter,
});
const filteredRequirements = filterByName({ items: requirements, only });

if (appDirs.length === 0 && filter === undefined) {
    console.error('No apps found in', join(workspaceRoot, 'apps'));
    process.exit(1);
}

const errors: Array<string> = [
    ...(await fixProjects({ projectDirs: appDirs, projectType: 'app', filteredRequirements })),
    ...(await fixProjects({
        projectDirs: packageDirs,
        projectType: 'package',
        filteredRequirements,
    })),
];

if (errors.length > 0) {
    console.error(red('\nFix had errors:\n'));

    for (const error of errors) {
        console.error(red(`  ✗ ${error}`));
    }

    console.error(red(`\n${errors.length} error(s) found.`));
    process.exit(1);
}

console.log(green(`\n✓ Fixed ${appDirs.length} app(s) and ${packageDirs.length} package(s).`));
