import { runCommand } from '@minimalist-apps/cli';

const emulatorLogPath = '/tmp/android-e2e-emulator.log';
const waitTimeoutMs = 240_000;
const animationTimeoutMs = 60_000;

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
    const gpuMode = process.env.E2E_ANDROID_GPU_MODE ?? 'swiftshader_indirect';
    const memoryMb = process.env.E2E_ANDROID_MEMORY_MB ?? '4096';
    const cpuCores = process.env.E2E_ANDROID_CPU_CORES ?? '4';
    const args = ['-avd', avd];

    args.push(
        '-accel',
        'on',
        '-gpu',
        gpuMode,
        '-no-snapshot',
        '-memory',
        memoryMb,
        '-cores',
        cpuCores,
        '-noaudio',
        '-no-boot-anim',
        '-camera-back',
        'none',
        '-camera-front',
        'none',
        '-netfast',
    );

    if (isHeadless) {
        // cspell:ignore swiftshader
        args.push('-no-window');
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

const getFirstConnectedEmulatorDevice = (): string | null => {
    const output = runCommand('adb', ['devices']);

    const lines = output.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0 || trimmedLine.startsWith('List of devices attached')) {
            continue;
        }

        const [deviceId = '', status = ''] = trimmedLine.split(/\s+/);

        if (deviceId.startsWith('emulator-') && status === 'device') {
            return deviceId;
        }
    }

    return null;
};

const waitForConnectedEmulatorDevice = (): string => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < waitTimeoutMs) {
        const deviceId = getFirstConnectedEmulatorDevice();

        if (deviceId != null) {
            return deviceId;
        }

        runCommand('sleep', ['2']);
    }

    throw new Error('Timed out waiting for emulator device to appear in adb devices.');
};

const waitForBootCompleted = (deviceId: string): void => {
    const startedAt = Date.now();

    runCommand('adb', ['-s', deviceId, 'wait-for-device']);

    while (Date.now() - startedAt < waitTimeoutMs) {
        const output = runCommand('adb', ['-s', deviceId, 'shell', 'getprop', 'sys.boot_completed'])
            .replaceAll('\r', '')
            .trim();

        if (output === '1') {
            return;
        }

        runCommand('sleep', ['2']);
    }

    throw new Error(`Timed out waiting for Android device to boot: ${deviceId}`);
};

const disableAnimations = (deviceId: string): void => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < animationTimeoutMs) {
        try {
            runCommand('adb', [
                '-s',
                deviceId,
                'shell',
                'settings',
                'put',
                'global',
                'window_animation_scale',
                '0',
            ]);
            runCommand('adb', [
                '-s',
                deviceId,
                'shell',
                'settings',
                'put',
                'global',
                'transition_animation_scale',
                '0',
            ]);
            runCommand('adb', [
                '-s',
                deviceId,
                'shell',
                'settings',
                'put',
                'global',
                'animator_duration_scale',
                '0',
            ]);

            return;
        } catch {
            runCommand('sleep', ['2']);
        }
    }

    throw new Error(`Timed out applying animation settings on device: ${deviceId}`);
};

const main = (): void => {
    const isHeadless = process.env.E2E_ANDROID_HEADLESS === 'true';

    ensureEmulatorBinaryAvailable();

    const avd = selectAvd();

    try {
        startEmulator({ avd, isHeadless });
        const deviceId = waitForConnectedEmulatorDevice();
        waitForBootCompleted(deviceId);
        disableAnimations(deviceId);
        console.log(`Started emulator AVD '${avd}'${isHeadless ? ' in headless mode' : ''}.`);
    } catch (e) {
        console.log('Error:', (e as Error).message);
        process.exit(1);
    }
};

main();
