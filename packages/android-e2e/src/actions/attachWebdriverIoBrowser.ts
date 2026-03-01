import { attach } from 'webdriverio';

interface AttachWebdriverIoBrowserProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

export const attachWebdriverIoBrowser = ({
    serverUrl,
    sessionId,
}: AttachWebdriverIoBrowserProps) => {
    const url = new URL(serverUrl);

    const protocol = url.protocol.replace(':', '');
    const port = url.port.length > 0 ? Number(url.port) : protocol === 'https' ? 443 : 80;
    const path = url.pathname.length > 0 ? url.pathname : '/';

    return attach({
        capabilities: {
            'appium:automationName': 'UiAutomator2',
            platformName: 'Android',
        } as never,
        hostname: url.hostname,
        isMobile: true,
        isW3C: true,
        path,
        port,
        protocol,
        sessionId,
    });
};
