import {
    createSession,
    deleteSession,
    typeIntoElementByTestId,
    waitForElementByTestId,
    waitForElementTextByTestIdContains,
} from '@minimalist-apps/android-e2e';
import { afterEach, test } from 'vitest';
import {
    CIRCLE_AMOUNT_INPUT_TEST_ID,
    CIRCLE_NEW_DIAMETER_INPUT_TEST_ID,
    CIRCLE_ORIGINAL_DIAMETER_INPUT_TEST_ID,
    CIRCLE_RESULT_TEST_ID,
} from '../src/app/modules/circle/Circle';
import {
    RECTANGLE_AMOUNT_INPUT_TEST_ID,
    RECTANGLE_NEW_A_INPUT_TEST_ID,
    RECTANGLE_NEW_B_INPUT_TEST_ID,
    RECTANGLE_ORIGINAL_A_INPUT_TEST_ID,
    RECTANGLE_ORIGINAL_B_INPUT_TEST_ID,
    RECTANGLE_RESULT_TEST_ID,
} from '../src/app/modules/rectangle/Rectangle';

const serverUrl = process.env.E2E_APPIUM_SERVER_URL ?? 'http://127.0.0.1:4723';

const appPath = './android/app/build/outputs/apk/debug/app-debug.apk';

let currentSessionId: string | null = null;

afterEach(async () => {
    if (currentSessionId == null) {
        return;
    }

    await deleteSession({
        serverUrl,
        sessionId: currentSessionId,
    });

    currentSessionId = null;
});

test('smoke e2e calculates circle and rectangle amounts', async () => {
    const sessionId = await createSession({
        appPath,
        serverUrl,
    });

    currentSessionId = sessionId;

    await waitForElementByTestId({
        serverUrl,
        sessionId,
        testId: CIRCLE_AMOUNT_INPUT_TEST_ID,
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: CIRCLE_AMOUNT_INPUT_TEST_ID,
        text: '100',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: CIRCLE_ORIGINAL_DIAMETER_INPUT_TEST_ID,
        text: '20',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: CIRCLE_NEW_DIAMETER_INPUT_TEST_ID,
        text: '30',
    });

    await waitForElementTextByTestIdContains({
        serverUrl,
        sessionId,
        testId: CIRCLE_RESULT_TEST_ID,
        text: '225',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: RECTANGLE_AMOUNT_INPUT_TEST_ID,
        text: '100',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: RECTANGLE_ORIGINAL_A_INPUT_TEST_ID,
        text: '20',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: RECTANGLE_ORIGINAL_B_INPUT_TEST_ID,
        text: '30',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: RECTANGLE_NEW_A_INPUT_TEST_ID,
        text: '40',
    });

    await typeIntoElementByTestId({
        serverUrl,
        sessionId,
        testId: RECTANGLE_NEW_B_INPUT_TEST_ID,
        text: '60',
    });

    await waitForElementTextByTestIdContains({
        serverUrl,
        sessionId,
        testId: RECTANGLE_RESULT_TEST_ID,
        text: '400',
    });
});
