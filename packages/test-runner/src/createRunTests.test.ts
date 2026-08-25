import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import {
    createRunTests,
    parseTestRunnerArguments,
    type RunNode,
    type RunNodeProps,
} from './createRunTests.js';

const testSetupUrl = 'file:///workspace/test.setup.ts';

interface TestCreateRunTestsProps {
    readonly status?: number;
}

const testCreateRunTests = ({ status = 0 }: TestCreateRunTestsProps = {}) => {
    const calls: Array<RunNodeProps> = [];
    const runNode: RunNode = props => {
        calls.push(props);

        return status;
    };

    return {
        calls,
        runTests: createRunTests({ runNode, testSetupUrl }),
    };
};

describe(createRunTests.name, () => {
    test('runs project tests with the shared unit-test configuration', () => {
        const { calls, runTests } = testCreateRunTests();

        const status = runTests({
            additionalArguments: ['--test-name-pattern=parses rates'],
            cwd: '/workspace/apps/price-converter',
            profile: 'project',
        });

        assert.strictEqual(status, 0);
        assert.deepStrictEqual(calls, [
            {
                arguments: [
                    '--import=tsx',
                    `--import=${testSetupUrl}`,
                    '--test',
                    '--test-concurrency=1',
                    '--test-force-exit',
                    '--test-name-pattern=parses rates',
                    'src/**/*.test.ts',
                    'src/**/*.test.tsx',
                ],
                cwd: '/workspace/apps/price-converter',
            },
        ]);
    });

    test('runs all workspace tests from the repository root', () => {
        const { calls, runTests } = testCreateRunTests();

        runTests({ cwd: '/workspace', profile: 'workspace' });

        assert.deepStrictEqual(calls[0]?.arguments, [
            '--import=tsx',
            `--import=${testSetupUrl}`,
            '--test',
            '--test-concurrency=1',
            '--test-force-exit',
            'apps/**/*.test.ts',
            'apps/**/*.test.tsx',
            'packages/**/*.test.ts',
            'packages/**/*.test.tsx',
        ]);
    });

    test('runs E2E tests with their project global setup and without forced exit', () => {
        const { calls, runTests } = testCreateRunTests();
        const cwd = '/workspace/apps/android-sync';

        runTests({ cwd, profile: 'e2e' });

        assert.deepStrictEqual(calls[0]?.arguments, [
            '--import=tsx',
            '--test',
            '--test-concurrency=1',
            `--test-global-setup=${pathToFileURL(`${cwd}/e2e/globalSetup.ts`).href}`,
            'e2e/*.e2e.ts',
        ]);
    });

    test('returns the Node process status', () => {
        const { runTests } = testCreateRunTests({ status: 7 });

        assert.strictEqual(runTests({ cwd: '/workspace/packages/number', profile: 'project' }), 7);
    });
});

describe(parseTestRunnerArguments.name, () => {
    test('uses the project profile by default and preserves Node arguments', () => {
        assert.deepStrictEqual(parseTestRunnerArguments(['--test-name-pattern=undo']), {
            additionalArguments: ['--test-name-pattern=undo'],
            profile: 'project',
        });
    });

    test('removes the pnpm argument separator before forwarding Node arguments', () => {
        assert.deepStrictEqual(parseTestRunnerArguments(['--', '--test-name-pattern=undo']), {
            additionalArguments: ['--test-name-pattern=undo'],
            profile: 'project',
        });
    });

    test('extracts the workspace profile flag', () => {
        assert.deepStrictEqual(parseTestRunnerArguments(['--workspace', '--test-only']), {
            additionalArguments: ['--test-only'],
            profile: 'workspace',
        });
    });

    test('extracts the E2E profile flag', () => {
        assert.deepStrictEqual(parseTestRunnerArguments(['--e2e']), {
            additionalArguments: [],
            profile: 'e2e',
        });
    });

    test('rejects conflicting profile flags', () => {
        assert.throws(
            () => parseTestRunnerArguments(['--workspace', '--e2e']),
            /Only one test profile can be selected/,
        );
    });
});
