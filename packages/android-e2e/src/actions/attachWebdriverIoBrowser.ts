import { attach } from 'webdriverio';
import type { E2ESession } from '../session.ts';

interface AttachWebdriverIoBrowserProps {
    readonly session: E2ESession;
}

export const attachWebdriverIoBrowser = ({ session }: AttachWebdriverIoBrowserProps) => {
    const url = new URL(session.serverUrl);

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
        sessionId: session.sessionId,
    });
};
