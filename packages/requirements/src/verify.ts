#!/usr/bin/env tsx

import { basename, join, resolve } from 'node:path';
import { filterByName, filterDirs, getSubDirs, green, parseArgs, red } from '@minimalist-apps/cli';
import { requirements } from './allRequirements';
import type { ProjectType } from './requirements/Requirement';

// --- Helpers ---

interface VerifyProjectsProps {
    readonly projectDirs: ReadonlyArray<string>;
    readonly projectType: ProjectType;
    readonly filteredRequirements: ReadonlyArray<(typeof requirements)[number]>;
}

const verifyProjects = ({
    projectDirs,
    projectType,
    filteredRequirements,
}: VerifyProjectsProps): ReadonlyArray<string> => {
    const errors: Array<string> = [];

    for (const dir of projectDirs) {
        const dirName = basename(dir);

        for (const requirement of filteredRequirements) {
            if (!requirement.applies({ projectType, dirName })) {
                continue;
            }

            const requirementErrors = requirement.verify({ appDir: dir });

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
    ...verifyProjects({ projectDirs: appDirs, projectType: 'app', filteredRequirements }),
    ...verifyProjects({ projectDirs: packageDirs, projectType: 'package', filteredRequirements }),
];

if (errors.length > 0) {
    console.error(red('App standard verification failed:\n'));

    for (const error of errors) {
        console.error(red(`  ✗ ${error}`));
    }

    console.error(red(`\n${errors.length} error(s) found.`));
    process.exit(1);
}

console.log(
    green(
        `✓ All ${appDirs.length} app(s) and ${packageDirs.length} package(s) pass the standard checks.`,
    ),
);
