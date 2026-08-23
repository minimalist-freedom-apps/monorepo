import { afterEach, describe, expect, it, vi } from 'vitest';
import type { E2ESession } from '../session';

const actionMocks = vi.hoisted(() => ({
    attachWebdriverIoBrowser: vi.fn(),
    findElement: vi.fn(),
    isExisting: vi.fn(),
}));

vi.mock('./attachWebdriverIoBrowser.ts', () => ({
    attachWebdriverIoBrowser: actionMocks.attachWebdriverIoBrowser,
}));

const { isElementExistingByTestId } = await import('./isElementExistingByTestId');

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: vi.fn(),
};

afterEach(() => {
    vi.resetAllMocks();
});

describe(isElementExistingByTestId.name, () => {
    it('returns whether the test element exists', async () => {
        actionMocks.isExisting.mockResolvedValue(true);
        actionMocks.findElement.mockResolvedValue({
            isExisting: actionMocks.isExisting,
        });
        actionMocks.attachWebdriverIoBrowser.mockResolvedValue({
            $: actionMocks.findElement,
        });

        await expect(
            isElementExistingByTestId({ session, testId: 'settings-back-button' }),
        ).resolves.toBe(true);

        expect(actionMocks.findElement).toHaveBeenCalledExactlyOnceWith(
            '[data-testid="settings-back-button"]',
        );
    });
});
