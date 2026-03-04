import {
    clickElementByTestId,
    type E2ESession,
    getElementAttributeByTestId,
    typeIntoElementByTestId,
    waitForElementByTestId,
    waitForElementTextByTestIdContains,
} from '@minimalist-apps/android-e2e';

const EVOLU_ABANDON_TEST_SEED =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const EVOLU_ABANDON_SEED_OWNER_ID = 'F0xh0HpiAx5shgCgtGENww';

type RestoreEvoluSeedStepProps = {
    readonly session: E2ESession;
};

const openSettings = async ({ session }: RestoreEvoluSeedStepProps) => {
    await waitForElementByTestId({
        session,
        testId: 'open-settings-button',
    });

    await clickElementByTestId({
        session,
        testId: 'open-settings-button',
    });

    await waitForElementByTestId({
        session,
        testId: 'settings-back-button',
    });
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
        text: EVOLU_ABANDON_SEED_OWNER_ID.slice(-6),
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

export const restoreEvoluSeedStep = async (props: RestoreEvoluSeedStepProps): Promise<void> => {
    await openSettings(props);

    await enableDebug(props);

    await restoreSeed(props);

    await goBackFromSettings(props);

    await assertDebugOwnerSuffix(props);
};
