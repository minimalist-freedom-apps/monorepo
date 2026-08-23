import {
    clickElementByTestId,
    type E2ESession,
    getElementAttributeByTestId,
    isElementExistingByTestId,
    runWebViewFlow,
    typeIntoElementByTestId,
    waitForElementByTestId,
    waitForElementTextByTestIdContains,
} from '@minimalist-apps/android-e2e';

const EVOLU_ABANDON_TEST_SEED =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const EVOLU_ABANDON_SEED_OWNER_ID = 'F0xh0HpiAx5shgCgtGENww';
const expectedOwnerSuffix = EVOLU_ABANDON_SEED_OWNER_ID.slice(-6);

type RestoreEvoluSeedStepProps = {
    readonly session: E2ESession;
};

const ensureHome = async ({ session }: RestoreEvoluSeedStepProps) => {
    const isSettingsOpen = await isElementExistingByTestId({
        session,
        testId: 'settings-back-button',
    });

    if (isSettingsOpen) {
        await clickElementByTestId({
            session,
            testId: 'settings-back-button',
        });
    }

    await waitForElementByTestId({
        session,
        testId: 'open-settings-button',
    });
};

const openSettings = async ({ session }: RestoreEvoluSeedStepProps) => {
    await clickElementByTestId({
        session,
        testId: 'open-settings-button',
    });

    await waitForElementByTestId({
        session,
        testId: 'settings-back-button',
    });
};

const waitForExpectedOwner = async ({ session }: RestoreEvoluSeedStepProps): Promise<boolean> => {
    const isDebugOwnerVisible = await isElementExistingByTestId({
        session,
        testId: 'debug-owner-id',
    });

    if (!isDebugOwnerVisible) {
        return false;
    }

    for (let attempt = 1; attempt <= 10; attempt += 1) {
        const ownerText = await getElementAttributeByTestId({
            session,
            attribute: 'textContent',
            testId: 'debug-owner-id',
        });

        if (ownerText?.includes(expectedOwnerSuffix) === true) {
            return true;
        }

        await new Promise<void>(resolve => {
            setTimeout(resolve, 500);
        });
    }

    return false;
};

const restoreSeed = async ({ session }: RestoreEvoluSeedStepProps) => {
    await clickElementByTestId({
        session,
        testId: 'restore-backup-button',
    });

    await waitForElementByTestId({
        session,
        testId: 'restore-seed-input',
    });

    await typeIntoElementByTestId({
        session,
        testId: 'restore-seed-input',
        text: EVOLU_ABANDON_TEST_SEED,
    });

    await clickElementByTestId({
        session,
        testId: 'restore-modal-ok',
    });
};

const enableDebug = async ({ session }: RestoreEvoluSeedStepProps) => {
    await waitForElementByTestId({
        session,
        testId: 'debug-mode-switch',
    });

    const isDebugEnabled =
        (await getElementAttributeByTestId({
            session,
            attribute: 'aria-checked',
            testId: 'debug-mode-switch',
        })) === 'true';

    if (isDebugEnabled) {
        return;
    }

    await clickElementByTestId({
        session,
        testId: 'debug-mode-switch',
    });
};

const assertDebugOwnerSuffix = async ({ session }: RestoreEvoluSeedStepProps) => {
    await waitForElementTextByTestIdContains({
        session,
        testId: 'debug-owner-id',
        text: expectedOwnerSuffix,
    });
};

const goBackFromSettings = async ({ session }: RestoreEvoluSeedStepProps) => {
    await waitForElementByTestId({
        session,
        testId: 'settings-back-button',
    });

    await clickElementByTestId({
        session,
        testId: 'settings-back-button',
    });

    await waitForElementByTestId({
        session,
        testId: 'open-settings-button',
    });
};

const restoreEvoluSeed = async (props: RestoreEvoluSeedStepProps): Promise<void> => {
    await ensureHome(props);

    if (await waitForExpectedOwner(props)) {
        return;
    }

    await openSettings(props);
    await enableDebug(props);
    await restoreSeed(props);
    await goBackFromSettings(props);
    await assertDebugOwnerSuffix(props);
};

export const restoreEvoluSeedStep = (props: RestoreEvoluSeedStepProps): Promise<void> =>
    runWebViewFlow({
        flow: () => restoreEvoluSeed(props),
    });
