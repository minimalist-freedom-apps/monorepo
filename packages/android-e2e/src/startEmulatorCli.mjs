import { execFileSync, spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';

const ensureBinaryAvailable = async binary => {
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

const getAvailableAvds = () => {
    const output = execFileSync('emulator', ['-list-avds'], {
        encoding: 'utf8',
    });

    return output
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
};

const selectAvd = () => {
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

const isHeadless = process.env.E2E_ANDROID_HEADLESS === 'true';
const avd = selectAvd();

await ensureBinaryAvailable('emulator');

const args = ['-avd', avd];

if (isHeadless) {
    args.push('-no-window', '-gpu', 'swiftshader_indirect', '-noaudio', '-no-boot-anim');
}

const child = spawn('emulator', args, {
    detached: true,
    stdio: 'ignore',
});

child.unref();

console.log(`Started emulator AVD '${avd}'${isHeadless ? ' in headless mode' : ''}.`);
