import assert from 'node:assert/strict';
import { describe, type TestContext, test } from 'node:test';
import type {
    clickElementByTestId as ClickElementByTestId,
    E2ESession,
    typeIntoElementByTestId as TypeIntoElementByTestId,
    waitForElementByTestId as WaitForElementByTestId,
} from '@minimalist-apps/android-e2e';
import { createRestoreEvoluSeedStep } from '../e2e/restoreEvoluSeedStep';

const session: E2ESession = {
    serverUrl: 'http://localhost:4723',
    sessionId: 'session-id',
    [Symbol.asyncDispose]: async () => undefined,
};

interface TestCreateRestoreEvoluSeedStepProps {
    readonly getElementAttributeByTestId: () => Promise<string | null>;
    readonly isElementExistingByTestId: () => Promise<boolean>;
    readonly testContext: TestContext;
}

const testCreateRestoreEvoluSeedStep = ({
    getElementAttributeByTestId,
    isElementExistingByTestId,
    testContext,
}: TestCreateRestoreEvoluSeedStepProps) => {
    const clickElementByTestId = testContext.mock.fn<typeof ClickElementByTestId>(
        async () => undefined,
    );
    const typeIntoElementByTestId = testContext.mock.fn<typeof TypeIntoElementByTestId>(
        async () => undefined,
    );
    const restoreEvoluSeedStep = createRestoreEvoluSeedStep({
        clickElementByTestId,
        getElementAttributeByTestId: testContext.mock.fn(getElementAttributeByTestId) as never,
        isElementExistingByTestId: testContext.mock.fn(isElementExistingByTestId) as never,
        runWebViewFlow: ({ flow }) => flow(),
        typeIntoElementByTestId,
        waitForElementByTestId: testContext.mock.fn<typeof WaitForElementByTestId>(
            async () => 'element-id',
        ),
        waitForElementTextByTestIdContains: testContext.mock.fn(async () => undefined),
    });

    return {
        clickElementByTestId,
        restoreEvoluSeedStep,
        typeIntoElementByTestId,
    };
};

describe(createRestoreEvoluSeedStep.name, () => {
    test('does not repeat the restore when the expected owner is already active', async testContext => {
        let existenceCheck = 0;
        const deps = testCreateRestoreEvoluSeedStep({
            getElementAttributeByTestId: async () => '🐛tGENww',
            isElementExistingByTestId: () => {
                existenceCheck += 1;

                return Promise.resolve(existenceCheck === 2);
            },
            testContext,
        });

        await deps.restoreEvoluSeedStep({ session });

        assert.strictEqual(deps.clickElementByTestId.mock.callCount(), 0);
        assert.strictEqual(deps.typeIntoElementByTestId.mock.callCount(), 0);
    });

    test('restores the seed from a known home-screen state', async testContext => {
        const deps = testCreateRestoreEvoluSeedStep({
            getElementAttributeByTestId: async () => 'false',
            isElementExistingByTestId: async () => false,
            testContext,
        });

        await deps.restoreEvoluSeedStep({ session });

        assert.deepStrictEqual(
            deps.clickElementByTestId.mock.calls.map(call => call.arguments[0].testId),
            [
                'open-settings-button',
                'debug-mode-switch',
                'restore-backup-button',
                'restore-modal-ok',
                'settings-back-button',
            ],
        );
        assert.strictEqual(deps.typeIntoElementByTestId.mock.callCount(), 1);
        assert.deepStrictEqual(deps.typeIntoElementByTestId.mock.calls[0]?.arguments, [
            {
                session,
                testId: 'restore-seed-input',
                text: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            },
        ]);
    });
});
