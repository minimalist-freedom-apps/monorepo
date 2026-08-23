import { afterEach, describe, expect, it, vi } from 'vitest';
import type { E2ESession } from '../session';

const actionMocks = vi.hoisted(() => ({
    attachWebdriverIoBrowser: vi.fn(),
    setAppiumContext: vi.fn(),
    switchContext: vi.fn(),
    waitForWebViewContext: vi.fn(),
}));

vi.mock('./attachWebdriverIoBrowser.ts', () => ({
    attachWebdriverIoBrowser: actionMocks.attachWebdriverIoBrowser,
}));
vi.mock('./setAppiumContext.ts', () => ({
    setAppiumContext: actionMocks.setAppiumContext,
}));
vi.mock('./waitForWebViewContext.ts', () => ({
    waitForWebViewContext: actionMocks.waitForWebViewContext,
}));

const { runWebViewAction } = await import('./runWebViewAction');

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: vi.fn(),
};

afterEach(() => {
    vi.resetAllMocks();
});

describe(runWebViewAction.name, () => {
    it('reconnects the WebView and retries after its window is recreated', async () => {
        const action = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('no such window: target window already closed'))
            .mockResolvedValue('completed');
        actionMocks.attachWebdriverIoBrowser.mockResolvedValue({
            switchContext: actionMocks.switchContext,
        });
        actionMocks.waitForWebViewContext.mockResolvedValue('WEBVIEW_app');

        await expect(runWebViewAction({ action, session })).resolves.toBe('completed');

        expect(action).toHaveBeenCalledTimes(2);
        expect(actionMocks.switchContext).toHaveBeenCalledExactlyOnceWith('NATIVE_APP');
        expect(actionMocks.setAppiumContext).toHaveBeenCalledExactlyOnceWith({
            contextName: 'WEBVIEW_app',
            session,
        });
    });

    it('does not retry unrelated action failures', async () => {
        const actionError = new Error('Element is disabled');
        const action = vi.fn<() => Promise<void>>().mockRejectedValue(actionError);

        await expect(runWebViewAction({ action, session })).rejects.toBe(actionError);

        expect(action).toHaveBeenCalledOnce();
        expect(actionMocks.attachWebdriverIoBrowser).not.toHaveBeenCalled();
    });
});
