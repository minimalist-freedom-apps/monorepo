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

const { runWebViewAction, runWebViewFlow } = await import('./runWebViewAction');

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

    it('reconnects but does not replay a mutation automatically', async () => {
        const action = vi
            .fn<() => Promise<void>>()
            .mockRejectedValue(
                new Error(
                    'disconnected: Unable to receive message from renderer (disconnected: not connected to DevTools)',
                ),
            );
        actionMocks.attachWebdriverIoBrowser.mockResolvedValue({
            switchContext: actionMocks.switchContext,
        });
        actionMocks.waitForWebViewContext.mockResolvedValue('WEBVIEW_app');

        await expect(runWebViewAction({ action, replay: 'never', session })).rejects.toThrow(
            'WebView action was interrupted',
        );

        expect(action).toHaveBeenCalledOnce();
        expect(actionMocks.switchContext).toHaveBeenCalledExactlyOnceWith('NATIVE_APP');
    });
});

describe(runWebViewFlow.name, () => {
    it('restarts a flow after an interrupted mutation', async () => {
        const mutation = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error('no such window: target window already closed'))
            .mockResolvedValue('completed');
        const flow = vi.fn(() => runWebViewAction({ action: mutation, replay: 'never', session }));
        actionMocks.attachWebdriverIoBrowser.mockResolvedValue({
            switchContext: actionMocks.switchContext,
        });
        actionMocks.waitForWebViewContext.mockResolvedValue('WEBVIEW_app');

        await expect(runWebViewFlow({ flow })).resolves.toBe('completed');

        expect(flow).toHaveBeenCalledTimes(2);
        expect(mutation).toHaveBeenCalledTimes(2);
    });
});
