import type { E2ESession } from '@minimalist-apps/android-e2e';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const actionMocks = vi.hoisted(() => ({
    clickElementByTestId: vi.fn(),
    getElementAttributeByTestId: vi.fn(),
    isElementExistingByTestId: vi.fn(),
    runWebViewFlow: vi.fn(),
    typeIntoElementByTestId: vi.fn(),
    waitForElementByTestId: vi.fn(),
    waitForElementTextByTestIdContains: vi.fn(),
}));

vi.mock('@minimalist-apps/android-e2e', () => actionMocks);

const { restoreEvoluSeedStep } = await import('../e2e/restoreEvoluSeedStep');

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: vi.fn(),
};

beforeEach(() => {
    actionMocks.runWebViewFlow.mockImplementation(
        ({ flow }: { readonly flow: () => Promise<void> }) => flow(),
    );
});

afterEach(() => {
    vi.resetAllMocks();
});

describe(restoreEvoluSeedStep.name, () => {
    it('does not repeat the restore when the expected owner is already active', async () => {
        actionMocks.isElementExistingByTestId
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        actionMocks.getElementAttributeByTestId.mockResolvedValue('🐛tGENww');

        await restoreEvoluSeedStep({ session });

        expect(actionMocks.clickElementByTestId).not.toHaveBeenCalled();
        expect(actionMocks.typeIntoElementByTestId).not.toHaveBeenCalled();
    });

    it('restores the seed from a known home-screen state', async () => {
        actionMocks.isElementExistingByTestId.mockResolvedValue(false);
        actionMocks.getElementAttributeByTestId.mockResolvedValue('false');

        await restoreEvoluSeedStep({ session });

        expect(actionMocks.clickElementByTestId.mock.calls.map(([props]) => props.testId)).toEqual([
            'open-settings-button',
            'debug-mode-switch',
            'restore-backup-button',
            'restore-modal-ok',
            'settings-back-button',
        ]);
        expect(actionMocks.typeIntoElementByTestId).toHaveBeenCalledExactlyOnceWith({
            session,
            testId: 'restore-seed-input',
            text: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        });
    });
});
