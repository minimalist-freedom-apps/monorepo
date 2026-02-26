import { spawnSync } from 'node:child_process';

type RunCommandOptions = {
    readonly cwd?: string;
    readonly allowFailure?: boolean;
};

export const runCommand = (
    command: string,
    args: readonly string[],
    options?: RunCommandOptions,
): string => {
    const result = spawnSync(command, args, {
        cwd: options?.cwd,
        encoding: 'utf8',
        stdio: 'pipe',
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const stdout = (result.stdout ?? '').toString();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const stderr = (result.stderr ?? '').toString();
    const spawnError = result.error?.message;

    if (options?.allowFailure !== true && (result.status !== 0 || result.error != null)) {
        throw new Error(
            `Command failed: ${command} ${args.join(' ')}\n` +
                `Exit code: ${String(result.status)}\n` +
                `Spawn error: ${spawnError ?? 'none'}\n` +
                `Stdout:\n${stdout}\n` +
                `Stderr:\n${stderr}`,
        );
    }

    return stdout;
};
