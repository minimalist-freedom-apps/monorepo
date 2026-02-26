import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { sleep } from '@minimalist-apps/utils';

// cspell:ignore getprop

interface AssertBinaryAvailableProps {
    readonly binary: string;
}

interface AssertPathExistsProps {
    readonly filePath: string;
}

interface CreateAndroidE2EGlobalSetupProps {
    readonly appDirectory: string;
    readonly defaultAppPath?: string;
}

const bootTimeoutMs = 240_000;
const pollIntervalMs = 2_000;

const assertBinaryAvailable = async ({ binary }: AssertBinaryAvailableProps): Promise<void> => {
    const pathValue = process.env.PATH ?? '';
    const pathSegments = pathValue.split(':');

    for (const directoryPath of pathSegments) {
        if (directoryPath.length === 0) {
            continue;
        }

        try {
            await access(join(directoryPath, binary));

            return;
        } catch {}
    }

    throw new Error(`Required binary not found in PATH: ${binary}`);
};

const assertPathExists = async ({ filePath }: AssertPathExistsProps): Promise<void> => {
    try {
        await access(filePath);
    } catch {
        throw new Error(`Required file not found: ${filePath}`);
    }
};

const assertAndroidEnvironment = async (): Promise<void> => {
    const androidHome = process.env.ANDROID_HOME;

    if (androidHome == null || androidHome.length === 0) {
        throw new Error('ANDROID_HOME environment variable is required.');
    }

    await assertPathExists({
        filePath: join(androidHome, 'platform-tools', 'adb'),
    });
};

const getAdbDevices = (): ReadonlyArray<string> => {
    const output = execFileSync('adb', ['devices'], {
        encoding: 'utf8',
    });

    const lines = output.split('\n');

    return lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith('List of devices attached'))
        .filter(line => line.endsWith('\tdevice'))
        .map(line => line.split('\t')[0] ?? '')
        .filter(deviceId => deviceId.length > 0);
};

const waitForConnectedDevice = async (): Promise<void> => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < bootTimeoutMs) {
        if (getAdbDevices().length > 0) {
            return;
        }

        await sleep(pollIntervalMs);
    }

    throw new Error(
        'No connected Android device found. Start an emulator (locally) or ensure CI starts one before running E2E tests.',
    );
};

const createDefaultAppPath = ({ appDirectory }: { readonly appDirectory: string }): string =>
    join(appDirectory, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

export const createAndroidE2EGlobalSetup = ({
    appDirectory,
    defaultAppPath,
}: CreateAndroidE2EGlobalSetupProps): (() => Promise<void>) => {
    const resolvedDefaultAppPath = defaultAppPath ?? createDefaultAppPath({ appDirectory });

    return async (): Promise<void> => {
        await assertBinaryAvailable({ binary: 'adb' });
        await assertBinaryAvailable({ binary: 'appium' });
        await assertAndroidEnvironment();
        await waitForConnectedDevice();

        const appPath = process.env.E2E_ANDROID_APP_PATH ?? resolvedDefaultAppPath;
        await assertPathExists({ filePath: appPath });
    };
};
