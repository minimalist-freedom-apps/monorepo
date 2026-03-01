import {
    clickElementById,
    typeIntoElementById,
    waitForElementById,
    waitForElementTextByIdContains,
    waitForReload,
} from '@minimalist-apps/android-e2e';

const EVOLU_ABANDOn_TEST_SEED =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

const EVOLU_ABANDON_SEED_OWNER_ID = 'F0xh0HpiAx5shgCgtGENww';

type RestoreEvoluSeedStepProps = {
    readonly serverUrl: string;
    readonly sessionId: string;
};

const openSettings = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementById({
        id: 'open-settings-button',
        serverUrl,
        sessionId,
    });

    await clickElementById({
        id: 'open-settings-button',
        serverUrl,
        sessionId,
    });

    await waitForElementById({
        id: 'settings-back-button',
        serverUrl,
        sessionId,
    });
};

const restoreSeed = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await clickElementById({
        id: 'restore-backup-button',
        serverUrl,
        sessionId,
    });

    await waitForElementById({
        id: 'restore-seed-input',
        serverUrl,
        sessionId,
    });

    await typeIntoElementById({
        id: 'restore-seed-input',
        serverUrl,
        sessionId,
        text: EVOLU_ABANDOn_TEST_SEED,
    });

    await clickElementById({
        id: 'restore-modal-ok',
        serverUrl,
        sessionId,
    });
};

const enableDebug = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementById({
        id: 'debug-mode-switch',
        serverUrl,
        sessionId,
    });

    await clickElementById({
        id: 'debug-mode-switch',
        serverUrl,
        sessionId,
    });
};

const assertDebugOwnerSuffix = async ({ serverUrl, sessionId }: RestoreEvoluSeedStepProps) => {
    await waitForElementTextByIdContains({
        id: 'debug-owner-id',
        serverUrl,
        sessionId,
        text: EVOLU_ABANDON_SEED_OWNER_ID.slice(-6),
    });
};

export const restoreEvoluSeedStep = async (props: RestoreEvoluSeedStepProps): Promise<void> => {
    await openSettings(props);

    await enableDebug(props);

    await restoreSeed(props);

    await waitForReload(props);

    await assertDebugOwnerSuffix(props);
};
