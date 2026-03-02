import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const workspaceRoot = process.cwd();

const bunStoreDir = join(workspaceRoot, 'node_modules', '.bun');

if (!existsSync(bunStoreDir)) {
    process.exit(0);
}

const evoluMonorepoStoreDirName = readdirSync(bunStoreDir).find(
    entry => entry.startsWith('@evolu+monorepo@github+') && entry.includes('+evolu+'),
);

if (evoluMonorepoStoreDirName === undefined) {
    process.exit(0);
}

const evoluMonorepoDir = join(
    bunStoreDir,
    evoluMonorepoStoreDirName,
    'node_modules',
    '@evolu',
    'monorepo',
);

const evoluCommonDir = join(evoluMonorepoDir, 'packages', 'common');
const evoluWebDir = join(evoluMonorepoDir, 'packages', 'web');

if (!existsSync(evoluCommonDir) || !existsSync(evoluWebDir)) {
    process.exit(0);
}

const runOrFail = (args, cwd, label) => {
    const result = spawnSync('bun', args, {
        cwd,
        stdio: 'inherit',
    });

    if (result.status !== 0) {
        console.error(
            `[fix-evolu-git-deps] ${label} failed with exit code ${String(result.status)}.`,
        );
        process.exit(result.status ?? 1);
    }
};

runOrFail(['install'], evoluMonorepoDir, 'bun install in evolu monorepo');
runOrFail(
    ['run', '--filter', '@evolu/common', 'prepack'],
    evoluMonorepoDir,
    'prepack for @evolu/common',
);
runOrFail(['run', '--filter', '@evolu/web', 'prepack'], evoluMonorepoDir, 'prepack for @evolu/web');

const workspaceDirs = [
    workspaceRoot,
    ...readdirSync(join(workspaceRoot, 'apps')).map(name => join(workspaceRoot, 'apps', name)),
    ...readdirSync(join(workspaceRoot, 'packages')).map(name =>
        join(workspaceRoot, 'packages', name),
    ),
];

const relink = (workspaceDir, packageName, targetDir) => {
    const scopeDir = join(workspaceDir, 'node_modules', '@evolu');
    const linkPath = join(scopeDir, packageName);

    mkdirSync(scopeDir, { recursive: true });

    if (existsSync(linkPath)) {
        const stat = lstatSync(linkPath);

        if (stat.isDirectory() || stat.isSymbolicLink()) {
            rmSync(linkPath, { recursive: true, force: true });
        }
    }

    symlinkSync(targetDir, linkPath, 'dir');
};

for (const workspaceDir of workspaceDirs) {
    relink(workspaceDir, 'common', evoluCommonDir);
    relink(workspaceDir, 'web', evoluWebDir);
}
