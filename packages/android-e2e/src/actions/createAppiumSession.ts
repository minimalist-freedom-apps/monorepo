import { readFile } from 'node:fs/promises';
import { remote } from 'webdriverio';

interface CreateAppiumSessionProps {
    readonly serverUrl: string;
    readonly appPath: string;
}

interface AppiumSession {
    readonly sessionId: string;
}

export const createAppiumSession = async ({
    serverUrl,
    appPath,
}: CreateAppiumSessionProps): Promise<AppiumSession> => {
    await readFile(appPath);

    const url = new URL(serverUrl);
    const protocol = url.protocol.replace(':', '');
    const port = url.port.length > 0 ? Number(url.port) : protocol === 'https' ? 443 : 80;
    const path = url.pathname.length > 0 ? url.pathname : '/';

    const browser = await remote({
        capabilities: {
            'appium:app': appPath,
            // cspell:ignore uiautomator
            // cspell:ignore chromedriver
            'appium:automationName': 'UiAutomator2',
            'appium:chromedriverAutodownload': true,
            'appium:enforceAppInstall': true,
            'appium:newCommandTimeout': 120,
            'appium:noReset': false,
            platformName: 'Android',
        } as never,
        hostname: url.hostname,
        path,
        port,
        protocol,
    });

    if (typeof browser.sessionId === 'string') {
        return { sessionId: browser.sessionId };
    }

    throw new Error('Invalid create session response from WebdriverIO/Appium.');
};
