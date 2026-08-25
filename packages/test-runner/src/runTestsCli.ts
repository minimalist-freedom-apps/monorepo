#!/usr/bin/env tsx

import { spawnSync } from 'node:child_process';
import { createRunTests, parseTestRunnerArguments, type RunNode } from './createRunTests.js';

const runNode: RunNode = ({ arguments: arguments_, cwd }) => {
    const result = spawnSync(process.execPath, arguments_, {
        cwd,
        stdio: 'inherit',
    });

    if (result.error !== undefined) {
        throw result.error;
    }

    return result.status ?? 1;
};

const testSetupUrl = new URL('./testSetup.ts', import.meta.url).href;
const runTests = createRunTests({ runNode, testSetupUrl });
const { additionalArguments, profile } = parseTestRunnerArguments(process.argv.slice(2));

process.exitCode = runTests({
    additionalArguments,
    cwd: process.cwd(),
    profile,
});
