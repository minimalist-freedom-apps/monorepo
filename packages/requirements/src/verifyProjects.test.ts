import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { Requirement } from './requirements/Requirement';
import { verifyProjects } from './verifyProjects';

const createTempDir = (): string => mkdtempSync(join(tmpdir(), 'verify-'));

const createMockRequirement = ({
    name,
    applies = () => true,
    verify = () => [],
}: Partial<Requirement> & { name: string }): Requirement => ({
    name,
    applies,
    verify,
    fix: async () => [],
});

describe(verifyProjects.name, () => {
    let appDir: string;

    beforeEach(() => {
        appDir = createTempDir();
    });

    afterEach(() => {
        rmSync(appDir, { recursive: true, force: true });
    });

    test('returns no errors when all requirements pass', async () => {
        const errors = await verifyProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [createMockRequirement({ name: 'passing-req' })],
        });

        expect(errors).toEqual([]);
    });

    test('returns errors from a failing requirement', async () => {
        const errors = await verifyProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'failing-req',
                    verify: () => ['something is wrong'],
                }),
            ],
        });

        expect(errors).toEqual([`${appDir} [failing-req]: something is wrong`]);
    });

    test('collects errors from multiple requirements', async () => {
        const errors = await verifyProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'req-a',
                    verify: () => ['error from a'],
                }),
                createMockRequirement({
                    name: 'req-b',
                    verify: () => ['error from b'],
                }),
            ],
        });

        expect(errors).toEqual([
            `${appDir} [req-a]: error from a`,
            `${appDir} [req-b]: error from b`,
        ]);
    });

    test('collects errors across multiple project dirs', async () => {
        const secondDir = createTempDir();

        const errors = await verifyProjects({
            projectDirs: [appDir, secondDir],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'req-a',
                    verify: () => ['broken'],
                }),
            ],
        });

        expect(errors).toEqual([`${appDir} [req-a]: broken`, `${secondDir} [req-a]: broken`]);

        rmSync(secondDir, { recursive: true, force: true });
    });

    test('skips requirements that do not apply', async () => {
        const errors = await verifyProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'skipped-req',
                    applies: () => false,
                    verify: () => ['should not appear'],
                }),
            ],
        });

        expect(errors).toEqual([]);
    });

    test('applies is called with correct projectType and dirName', async () => {
        const appliesCalls: Array<{ projectType: string; dirName: string }> = [];

        await verifyProjects({
            projectDirs: [appDir],
            projectType: 'package',
            filteredRequirements: [
                createMockRequirement({
                    name: 'spy-req',
                    applies: ({ projectType, dirName }) => {
                        appliesCalls.push({ projectType, dirName });

                        return false;
                    },
                }),
            ],
        });

        expect(appliesCalls).toHaveLength(1);
        expect(appliesCalls[0]?.projectType).toBe('package');
    });

    test('returns no errors when project dirs are empty', async () => {
        const errors = await verifyProjects({
            projectDirs: [],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'req',
                    verify: () => ['should not appear'],
                }),
            ],
        });

        expect(errors).toEqual([]);
    });

    test('collects multiple errors from a single requirement', async () => {
        const errors = await verifyProjects({
            projectDirs: [appDir],
            projectType: 'app',
            filteredRequirements: [
                createMockRequirement({
                    name: 'multi-error-req',
                    verify: () => ['first error', 'second error'],
                }),
            ],
        });

        expect(errors).toEqual([
            `${appDir} [multi-error-req]: first error`,
            `${appDir} [multi-error-req]: second error`,
        ]);
    });
});
