import { join } from 'node:path';

type TestProfile = 'project' | 'workspace' | 'e2e';

export interface RunNodeProps {
    readonly arguments: ReadonlyArray<string>;
    readonly cwd: string;
}

export type RunNode = (props: RunNodeProps) => number;

export interface RunTestsDeps {
    readonly runNode: RunNode;
    readonly testSetupUrl: string;
}

interface RunTestsProps {
    readonly additionalArguments?: ReadonlyArray<string>;
    readonly cwd: string;
    readonly profile: TestProfile;
}

export type RunTests = (props: RunTestsProps) => number;

export interface ParsedTestRunnerArguments {
    readonly additionalArguments: ReadonlyArray<string>;
    readonly profile: TestProfile;
}

const workspaceProfileArgument = '--workspace';
const e2eProfileArgument = '--e2e';

export const parseTestRunnerArguments = (
    arguments_: ReadonlyArray<string>,
): ParsedTestRunnerArguments => {
    const isWorkspace = arguments_.includes(workspaceProfileArgument);
    const isE2E = arguments_.includes(e2eProfileArgument);

    if (isWorkspace && isE2E) {
        throw new Error('Only one test profile can be selected.');
    }

    return {
        additionalArguments: arguments_.filter(
            argument =>
                argument !== '--' &&
                argument !== workspaceProfileArgument &&
                argument !== e2eProfileArgument,
        ),
        profile: isWorkspace ? 'workspace' : isE2E ? 'e2e' : 'project',
    };
};

interface CreateUnitTestArgumentsProps {
    readonly additionalArguments: ReadonlyArray<string>;
    readonly profile: Exclude<TestProfile, 'e2e'>;
    readonly testSetupUrl: string;
}

const createUnitTestArguments = ({
    additionalArguments,
    profile,
    testSetupUrl,
}: CreateUnitTestArgumentsProps): ReadonlyArray<string> => {
    const testGlobs =
        profile === 'workspace'
            ? [
                  'apps/**/*.test.ts',
                  'apps/**/*.test.tsx',
                  'packages/**/*.test.ts',
                  'packages/**/*.test.tsx',
              ]
            : ['src/**/*.test.ts', 'src/**/*.test.tsx'];

    return [
        '--import=tsx',
        `--import=${testSetupUrl}`,
        '--test',
        '--test-concurrency=1',
        '--test-force-exit',
        ...additionalArguments,
        ...testGlobs,
    ];
};

interface CreateE2ETestArgumentsProps {
    readonly additionalArguments: ReadonlyArray<string>;
    readonly cwd: string;
}

const createE2ETestArguments = ({
    additionalArguments,
    cwd,
}: CreateE2ETestArgumentsProps): ReadonlyArray<string> => [
    '--import=tsx',
    '--test',
    '--test-concurrency=1',
    `--test-global-setup=${join(cwd, 'e2e/globalSetup.ts')}`,
    ...additionalArguments,
    'e2e/*.e2e.ts',
];

export const createRunTests =
    (deps: RunTestsDeps): RunTests =>
    props => {
        const additionalArguments = props.additionalArguments ?? [];
        const arguments_ =
            props.profile === 'e2e'
                ? createE2ETestArguments({ additionalArguments, cwd: props.cwd })
                : createUnitTestArguments({
                      additionalArguments,
                      profile: props.profile,
                      testSetupUrl: deps.testSetupUrl,
                  });

        return deps.runNode({ arguments: arguments_, cwd: props.cwd });
    };
