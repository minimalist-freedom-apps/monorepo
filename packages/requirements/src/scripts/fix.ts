#!/usr/bin/env tsx

import { join, resolve } from 'node:path';
import { filterDirs, getSubDirs, green, parseArgs, red } from '@minimalist-apps/cli';
import { requirements } from '../allRequirements';
import { filterRequirementsByName } from '../filterRequirementsByName';
import { fixProjects } from '../fixProjects';

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
