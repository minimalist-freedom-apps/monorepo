import {
    createSession,
    typeIntoElementByTestId,
    waitForElementByTestId,
    waitForElementTextByTestIdContains,
} from '@minimalist-apps/android-e2e';
import { test } from 'vitest';
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

test('smoke e2e calculates circle and rectangle amounts', async () => {
    await using session = await createSession({
        appPath,
        serverUrl,
    });

    await waitForElementByTestId({
        session,
        testId: CIRCLE_AMOUNT_INPUT_TEST_ID,
    });

    await typeIntoElementByTestId({
        session,
        testId: CIRCLE_AMOUNT_INPUT_TEST_ID,
        text: '100',
    });

    await typeIntoElementByTestId({
        session,
        testId: CIRCLE_ORIGINAL_DIAMETER_INPUT_TEST_ID,
        text: '20',
    });

    await typeIntoElementByTestId({
        session,
        testId: CIRCLE_NEW_DIAMETER_INPUT_TEST_ID,
        text: '30',
    });

    await waitForElementTextByTestIdContains({
        session,
        testId: CIRCLE_RESULT_TEST_ID,
        text: '225',
    });

    await typeIntoElementByTestId({
        session,
        testId: RECTANGLE_AMOUNT_INPUT_TEST_ID,
        text: '100',
    });

    await typeIntoElementByTestId({
        session,
        testId: RECTANGLE_ORIGINAL_A_INPUT_TEST_ID,
        text: '20',
    });

    await typeIntoElementByTestId({
        session,
        testId: RECTANGLE_ORIGINAL_B_INPUT_TEST_ID,
        text: '30',
    });

    await typeIntoElementByTestId({
        session,
        testId: RECTANGLE_NEW_A_INPUT_TEST_ID,
        text: '40',
    });

    await typeIntoElementByTestId({
        session,
        testId: RECTANGLE_NEW_B_INPUT_TEST_ID,
        text: '60',
    });

    await waitForElementTextByTestIdContains({
        session,
        testId: RECTANGLE_RESULT_TEST_ID,
        text: '400',
    });
});
