import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { Requirement } from './requirements/Requirement';
import { runProjects } from './runProjects';

const createTempDir = (): string => mkdtempSync(join(tmpdir(), 'run-'));

interface CreateMockRequirementProps {
    readonly name: string;
    readonly applies?: Requirement['applies'];
    readonly action?: () => ReadonlyArray<string>;
}

const createMockRequirement = ({
    name,
    applies = () => true,
    action = () => [],
}: CreateMockRequirementProps): {
    readonly requirement: Requirement;
    readonly action: () => ReadonlyArray<string>;
} => ({
    requirement: {
        name,
        applies,
        fix: async () => [],
        verify: () => [],
    },
    action,
});

describe(runProjects.name, () => {
    let appDir: string;

    beforeEach(() => {
        appDir = createTempDir();
    });

    afterEach(() => {
        rmSync(appDir, { recursive: true, force: true });
    });

    test('returns no errors when all requirements pass', async () => {
        const mock = createMockRequirement({ name: 'passing-req' });

        const errors = await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([]);
    });

    test('returns errors from a failing action', async () => {
        const mock = createMockRequirement({
            name: 'failing-req',
            action: () => ['something is wrong'],
        });

        const errors = await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([`${appDir} [failing-req]: something is wrong`]);
    });

    test('collects errors from multiple requirements', async () => {
        const mockA = createMockRequirement({
            name: 'req-a',
            action: () => ['error from a'],
        });
        const mockB = createMockRequirement({
            name: 'req-b',
            action: () => ['error from b'],
        });

        const errors = await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mockA.requirement, mockB.requirement],
            action: req => {
                if (req.name === 'req-a') {
                    return mockA.action();
                }

                return mockB.action();
            },
        });

        expect(errors).toEqual([
            `${appDir} [req-a]: error from a`,
            `${appDir} [req-b]: error from b`,
        ]);
    });

    test('collects errors across multiple project dirs', async () => {
        const secondDir = createTempDir();
        const mock = createMockRequirement({
            name: 'req-a',
            action: () => ['broken'],
        });

        const errors = await runProjects({
            projectDirs: [appDir, secondDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([`${appDir} [req-a]: broken`, `${secondDir} [req-a]: broken`]);

        rmSync(secondDir, { recursive: true, force: true });
    });

    test('skips requirements that do not apply', async () => {
        const mock = createMockRequirement({
            name: 'skipped-req',
            applies: () => false,
            action: () => ['should not appear'],
        });

        const errors = await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([]);
    });

    test('applies is called with correct projectType and dirName', async () => {
        const appliesCalls: Array<{ projectType: string; dirName: string }> = [];
        const mock = createMockRequirement({
            name: 'spy-req',
            applies: ({ projectType, dirName }) => {
                appliesCalls.push({ projectType, dirName });

                return false;
            },
        });

        await runProjects({
            projectDirs: [appDir],
            projectType: 'package',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(appliesCalls).toHaveLength(1);
        expect(appliesCalls[0]?.projectType).toBe('package');
    });

    test('returns no errors when project dirs are empty', async () => {
        const mock = createMockRequirement({
            name: 'req',
            action: () => ['should not appear'],
        });

        const errors = await runProjects({
            projectDirs: [],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([]);
    });

    test('collects multiple errors from a single requirement', async () => {
        const mock = createMockRequirement({
            name: 'multi-error-req',
            action: () => ['first error', 'second error'],
        });

        const errors = await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
        });

        expect(errors).toEqual([
            `${appDir} [multi-error-req]: first error`,
            `${appDir} [multi-error-req]: second error`,
        ]);
    });

    test('calls onDir for each project dir', async () => {
        const dirs: Array<string> = [];
        const mock = createMockRequirement({ name: 'req' });

        await runProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [mock.requirement],
            action: () => mock.action(),
            onDir: dir => {
                dirs.push(dir);
            },
        });

        expect(dirs).toEqual([appDir]);
    });
});
