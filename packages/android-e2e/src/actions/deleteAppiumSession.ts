import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { attachWebdriverIoBrowser } from './attachWebdriverIoBrowser.ts';

interface DeleteAppiumSessionProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

const isVideoRecordingEnabled = (): boolean => process.env.E2E_RECORD_VIDEO === 'true';

const getVideoOutputDirectory = (): string => process.env.E2E_VIDEO_OUTPUT_DIR ?? 'e2e-video';

const getVideoAppName = (): string => {
    const fromEnv = process.env.E2E_APP_NAME;

    if (fromEnv != null && fromEnv.length > 0) {
        return fromEnv;
    }

    const fromCwd = basename(process.cwd());

    if (fromCwd.length > 0) {
        return fromCwd;
    }

    return 'app';
};

const sanitizeVideoAppName = (value: string): string =>
    value.replaceAll(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

export const deleteSession = async ({
    serverUrl,
    sessionId,
}: DeleteAppiumSessionProps): Promise<void> => {
    const browser = await attachWebdriverIoBrowser({
        serverUrl,
        sessionId,
    });

    try {
        if (isVideoRecordingEnabled()) {
            const videoBase64 = await browser.stopRecordingScreen();

            if (videoBase64.length > 0) {
                await mkdir(getVideoOutputDirectory(), {
                    recursive: true,
                });

                const appName = sanitizeVideoAppName(getVideoAppName());
                const videoPath = join(
                    getVideoOutputDirectory(),
                    `${appName}-${Date.now()}-${sessionId}.mp4`,
                );

                await writeFile(videoPath, Buffer.from(videoBase64, 'base64'));
            }
        }
    } finally {
        await browser.deleteSession();
    }
};
