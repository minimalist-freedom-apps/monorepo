#!/usr/bin/env tsx

import { join, resolve } from 'node:path';
import { filterDirs, getSubDirs, green, parseArgs, red } from '@minimalist-apps/cli';
import { requirements } from '../allRequirements';
import { filterRequirementsByName } from '../filterRequirementsByName';
import { verifyProjects } from '../verifyProjects';

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
const filteredRequirements = filterRequirementsByName({ requirements, only });

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
