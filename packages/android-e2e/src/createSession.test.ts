import { afterEach, describe, expect, it, vi } from 'vitest';
import type { E2ESession } from './session';

const actionMocks = vi.hoisted(() => ({
    attachWebdriverIoBrowser: vi.fn(),
    createAppiumSession: vi.fn<() => Promise<{ readonly sessionId: string }>>(),
    deleteSession: vi.fn<({ session }: { readonly session: E2ESession }) => Promise<void>>(),
    setAppiumContext: vi.fn(),
    waitForWebViewContext: vi.fn<() => Promise<string>>(),
}));

vi.mock('./actions/attachWebdriverIoBrowser.ts', () => ({
    attachWebdriverIoBrowser: actionMocks.attachWebdriverIoBrowser,
}));
vi.mock('./actions/createAppiumSession.ts', () => ({
    createAppiumSession: actionMocks.createAppiumSession,
}));
vi.mock('./actions/deleteAppiumSession.ts', () => ({
    deleteSession: actionMocks.deleteSession,
}));
vi.mock('./actions/setAppiumContext.ts', () => ({
    setAppiumContext: actionMocks.setAppiumContext,
}));
vi.mock('./actions/waitForWebViewContext.ts', () => ({
    waitForWebViewContext: actionMocks.waitForWebViewContext,
}));

const { createSession } = await import('./createSession');

afterEach(() => {
    vi.resetAllMocks();
});

describe(createSession.name, () => {
    it('deletes the Appium session when WebView setup fails', async () => {
        const setupError = new Error('WebView setup failed');
        actionMocks.createAppiumSession.mockResolvedValue({ sessionId: 'session-id' });
        actionMocks.waitForWebViewContext.mockRejectedValue(setupError);
        actionMocks.deleteSession.mockResolvedValue();

        await expect(
            createSession({
                appPath: '/tmp/app.apk',
                serverUrl: 'http://localhost:4723',
            }),
        ).rejects.toBe(setupError);

        expect(actionMocks.deleteSession).toHaveBeenCalledExactlyOnceWith({
            session: expect.objectContaining({
                serverUrl: 'http://localhost:4723',
                sessionId: 'session-id',
            }),
        });
    });
});
