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

interface RestoreEvoluSeedStepDeps {
    readonly clickElementByTestId: typeof clickElementByTestId;
    readonly getElementAttributeByTestId: typeof getElementAttributeByTestId;
    readonly isElementExistingByTestId: typeof isElementExistingByTestId;
    readonly runWebViewFlow: typeof runWebViewFlow;
    readonly typeIntoElementByTestId: typeof typeIntoElementByTestId;
    readonly waitForElementByTestId: typeof waitForElementByTestId;
    readonly waitForElementTextByTestIdContains: typeof waitForElementTextByTestIdContains;
}

type RestoreEvoluSeedStepContext = RestoreEvoluSeedStepProps & {
    readonly deps: RestoreEvoluSeedStepDeps;
};

type RestoreEvoluSeedStep = (props: RestoreEvoluSeedStepProps) => Promise<void>;

const ensureHome = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    const isSettingsOpen = await deps.isElementExistingByTestId({
        session,
        testId: 'settings-back-button',
    });

    if (isSettingsOpen) {
        await deps.clickElementByTestId({
            session,
            testId: 'settings-back-button',
        });
    }

    await deps.waitForElementByTestId({
        session,
        testId: 'open-settings-button',
    });
};

const openSettings = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    await deps.clickElementByTestId({
        session,
        testId: 'open-settings-button',
    });

    await deps.waitForElementByTestId({
        session,
        testId: 'settings-back-button',
    });
};

const waitForExpectedOwner = async ({
    deps,
    session,
}: RestoreEvoluSeedStepContext): Promise<boolean> => {
    const isDebugOwnerVisible = await deps.isElementExistingByTestId({
        session,
        testId: 'debug-owner-id',
    });

    if (!isDebugOwnerVisible) {
        return false;
    }

    for (let attempt = 1; attempt <= 10; attempt += 1) {
        const ownerText = await deps.getElementAttributeByTestId({
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

const restoreSeed = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    await deps.clickElementByTestId({
        session,
        testId: 'restore-backup-button',
    });

    await deps.waitForElementByTestId({
        session,
        testId: 'restore-seed-input',
    });

    await deps.typeIntoElementByTestId({
        session,
        testId: 'restore-seed-input',
        text: EVOLU_ABANDON_TEST_SEED,
    });

    await deps.clickElementByTestId({
        session,
        testId: 'restore-modal-ok',
    });
};

const enableDebug = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    await deps.waitForElementByTestId({
        session,
        testId: 'debug-mode-switch',
    });

    const isDebugEnabled =
        (await deps.getElementAttributeByTestId({
            session,
            attribute: 'aria-checked',
            testId: 'debug-mode-switch',
        })) === 'true';

    if (isDebugEnabled) {
        return;
    }

    await deps.clickElementByTestId({
        session,
        testId: 'debug-mode-switch',
    });
};

const assertDebugOwnerSuffix = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    await deps.waitForElementTextByTestIdContains({
        session,
        testId: 'debug-owner-id',
        text: expectedOwnerSuffix,
    });
};

const goBackFromSettings = async ({ deps, session }: RestoreEvoluSeedStepContext) => {
    await deps.waitForElementByTestId({
        session,
        testId: 'settings-back-button',
    });

    await deps.clickElementByTestId({
        session,
        testId: 'settings-back-button',
    });

    await deps.waitForElementByTestId({
        session,
        testId: 'open-settings-button',
    });
};

const restoreEvoluSeed = async (props: RestoreEvoluSeedStepContext): Promise<void> => {
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

export const createRestoreEvoluSeedStep =
    (deps: RestoreEvoluSeedStepDeps): RestoreEvoluSeedStep =>
    ({ session }) =>
        deps.runWebViewFlow({
            flow: () => restoreEvoluSeed({ deps, session }),
        });

export const restoreEvoluSeedStep = createRestoreEvoluSeedStep({
    clickElementByTestId,
    getElementAttributeByTestId,
    isElementExistingByTestId,
    runWebViewFlow,
    typeIntoElementByTestId,
    waitForElementByTestId,
    waitForElementTextByTestIdContains,
});
