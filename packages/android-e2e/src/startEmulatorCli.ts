import { runCommand } from '@minimalist-apps/cli';

const emulatorLogPath = '/tmp/android-e2e-emulator.log';

const ensureEmulatorBinaryAvailable = (): void => {
    try {
        runCommand('which', ['emulator']);
    } catch {
        throw new Error('Required binary not found in PATH: emulator');
    }
};

const getAvailableAvds = (): ReadonlyArray<string> => {
    const output = runCommand('emulator', ['-list-avds']);

    return output
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
};

const selectAvd = (): string => {
    const preferredAvd = process.env.E2E_ANDROID_AVD;

    if (preferredAvd != null && preferredAvd.length > 0) {
        return preferredAvd;
    }

    const availableAvds = getAvailableAvds();
    const firstAvd = availableAvds.at(0);

    if (firstAvd == null) {
        throw new Error('No Android AVD found. Create one with Android Studio Device Manager.');
    }

    return firstAvd;
};

const escapeShellArg = (value: string): string => `'${value.replaceAll("'", `'"'"'`)}'`;

const printEmulatorLog = (): void => {
    const output = runCommand('sh', [
        '-lc',
        `[ -f ${escapeShellArg(emulatorLogPath)} ] && cat ${escapeShellArg(emulatorLogPath)} || echo "Emulator log file not found: ${emulatorLogPath}"`,
    ]);

    console.error(output);
};

const startEmulator = ({
    avd,
    isHeadless,
}: {
    readonly avd: string;
    readonly isHeadless: boolean;
}): void => {
    const args = ['-avd', avd];

    if (isHeadless) {
        // cspell:ignore swiftshader noaudio
        args.push('-no-window', '-gpu', 'swiftshader_indirect', '-noaudio', '-no-boot-anim');
    }

    const emulatorCommand = ['emulator', ...args].map(escapeShellArg).join(' ');
    const processId = runCommand('sh', [
        '-lc',
        `${emulatorCommand} >${escapeShellArg(emulatorLogPath)} 2>&1 & echo $!`,
    ]).trim();

    if (processId.length === 0 || Number.isNaN(Number(processId))) {
        throw new Error(`Failed to capture emulator process id. Output: '${processId}'`);
    }

    runCommand('sleep', ['2']);

    try {
        runCommand('kill', ['-0', processId]);
    } catch {
        printEmulatorLog();

        throw new Error('Failed to start emulator.');
    }
};

const main = (): void => {
    const isHeadless = process.env.E2E_ANDROID_HEADLESS === 'true';

    ensureEmulatorBinaryAvailable();

    const avd = selectAvd();

    try {
        startEmulator({ avd, isHeadless });
        console.log(`Started emulator AVD '${avd}'${isHeadless ? ' in headless mode' : ''}.`);
    } catch (e) {
        console.log('Error:', (e as Error).message);
        process.exit(1);
    }
};

main();
