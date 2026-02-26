import { readFile } from 'node:fs/promises';

interface CreateAppiumSessionProps {
    readonly serverUrl: string;
    readonly appPath: string;
}

interface AppiumSession {
    readonly sessionId: string;
}

interface AppiumRequestProps {
    readonly method: 'GET' | 'POST' | 'DELETE';
    readonly path: string;
    readonly serverUrl: string;
    readonly body?: unknown;
}

interface ParseCurrentPackageResponseProps {
    readonly payload: unknown;
}

interface GetCurrentAppPackageProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

interface DeleteAppiumSessionProps {
    readonly serverUrl: string;
    readonly sessionId: string;
}

interface IsPackageWithPrefixProps {
    readonly packageName: string;
    readonly packagePrefix: string;
}

interface WaitForWebViewContextProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly timeoutMs?: number;
}

interface SetAppiumContextProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly contextName: string;
}

interface FindElementByXPathProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly xPath: string;
}

interface WaitForElementByXPathProps extends FindElementByXPathProps {
    readonly timeoutMs?: number;
}

interface ClickElementByXPathProps extends FindElementByXPathProps {}

interface TypeIntoElementByXPathProps extends FindElementByXPathProps {
    readonly text: string;
}

interface ClickElementByXPathWithJavaScriptProps extends FindElementByXPathProps {}

interface FindElementByAndroidUiAutomatorProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly selector: string;
}

interface WaitForElementByAndroidUiAutomatorProps extends FindElementByAndroidUiAutomatorProps {
    readonly timeoutMs?: number;
}

interface ClickElementByAndroidUiAutomatorProps extends FindElementByAndroidUiAutomatorProps {}

interface TypeIntoElementByAndroidUiAutomatorProps extends FindElementByAndroidUiAutomatorProps {
    readonly text: string;
}

interface SleepProps {
    readonly milliseconds: number;
}

interface TapByViewportRatioProps {
    readonly serverUrl: string;
    readonly sessionId: string;
    readonly xRatio: number;
    readonly yRatio: number;
}

interface WindowRect {
    readonly width: number;
    readonly height: number;
}

const elementIdKey = 'element-6066-11e4-a52e-4f735466cecf';
const defaultTimeoutMs = 20_000;
const pollIntervalMs = 500;

const appiumRequest = async ({
    method,
    path,
    serverUrl,
    body,
}: AppiumRequestProps): Promise<unknown> => {
    const requestInit: RequestInit = {
        headers: {
            'content-type': 'application/json',
        },
        method,
    };

    if (body != null) {
        requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(new URL(path, serverUrl), requestInit);

    const text = await response.text();
    const payload = text.length > 0 ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(`Appium request failed (${response.status}): ${text}`);
    }

    return payload;
};

const parseCurrentPackageResponse = ({ payload }: ParseCurrentPackageResponseProps): string => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        typeof payload.value === 'string'
    ) {
        return payload.value;
    }

    throw new Error('Invalid current package response from Appium.');
};

const sleep = async ({ milliseconds }: SleepProps): Promise<void> => {
    await new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
};

const parseElementId = ({ payload }: { readonly payload: unknown }): string => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        typeof payload.value === 'object' &&
        payload.value !== null &&
        elementIdKey in payload.value &&
        typeof payload.value[elementIdKey] === 'string'
    ) {
        return payload.value[elementIdKey];
    }

    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        typeof payload.value === 'object' &&
        payload.value !== null &&
        'ELEMENT' in payload.value &&
        typeof payload.value.ELEMENT === 'string'
    ) {
        return payload.value.ELEMENT;
    }

    throw new Error('Invalid find element response from Appium.');
};

const parseWindowRectResponse = ({ payload }: { readonly payload: unknown }): WindowRect => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        typeof payload.value === 'object' &&
        payload.value !== null &&
        'width' in payload.value &&
        'height' in payload.value &&
        typeof payload.value.width === 'number' &&
        typeof payload.value.height === 'number'
    ) {
        return {
            height: payload.value.height,
            width: payload.value.width,
        };
    }

    throw new Error('Invalid window rect response from Appium.');
};

const parseContextsResponse = ({
    payload,
}: {
    readonly payload: unknown;
}): ReadonlyArray<string> => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        Array.isArray(payload.value) &&
        payload.value.every(item => typeof item === 'string')
    ) {
        return payload.value;
    }

    throw new Error('Invalid contexts response from Appium.');
};

export const createAppiumSession = async ({
    serverUrl,
    appPath,
}: CreateAppiumSessionProps): Promise<AppiumSession> => {
    await readFile(appPath);

    const payload = await appiumRequest({
        body: {
            capabilities: {
                alwaysMatch: {
                    'appium:app': appPath,
                    // cspell:ignore uiautomator
                    // cspell:ignore chromedriver
                    'appium:automationName': 'UiAutomator2',
                    'appium:chromedriverAutodownload': true,
                    'appium:enforceAppInstall': true,
                    'appium:newCommandTimeout': 120,
                    'appium:noReset': false,
                    platformName: 'Android',
                },
                firstMatch: [{}],
            },
        },
        method: 'POST',
        path: '/session',
        serverUrl,
    });

    if (
        typeof payload === 'object' &&
        payload !== null &&
        'value' in payload &&
        typeof payload.value === 'object' &&
        payload.value !== null &&
        'sessionId' in payload.value &&
        typeof payload.value.sessionId === 'string'
    ) {
        return { sessionId: payload.value.sessionId };
    }

    throw new Error('Invalid create session response from Appium.');
};

export const getCurrentAppPackage = async ({
    serverUrl,
    sessionId,
}: GetCurrentAppPackageProps): Promise<string> => {
    const payload = await appiumRequest({
        method: 'GET',
        path: `/session/${sessionId}/appium/device/current_package`,
        serverUrl,
    });

    return parseCurrentPackageResponse({ payload });
};

export const deleteAppiumSession = async ({
    serverUrl,
    sessionId,
}: DeleteAppiumSessionProps): Promise<void> => {
    await appiumRequest({
        method: 'DELETE',
        path: `/session/${sessionId}`,
        serverUrl,
    });
};

export const isPackageWithPrefix = ({
    packageName,
    packagePrefix,
}: IsPackageWithPrefixProps): boolean => packageName.startsWith(packagePrefix);

export const setAppiumContext = async ({
    serverUrl,
    sessionId,
    contextName,
}: SetAppiumContextProps): Promise<void> => {
    await appiumRequest({
        body: {
            name: contextName,
        },
        method: 'POST',
        path: `/session/${sessionId}/context`,
        serverUrl,
    });
};

export const waitForWebViewContext = async ({
    serverUrl,
    sessionId,
    timeoutMs = defaultTimeoutMs,
}: WaitForWebViewContextProps): Promise<string> => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const payload = await appiumRequest({
            method: 'GET',
            path: `/session/${sessionId}/contexts`,
            serverUrl,
        });

        const contexts = parseContextsResponse({ payload });
        const webViewContext = contexts.find(context => context.startsWith('WEBVIEW'));

        if (webViewContext != null) {
            return webViewContext;
        }

        await sleep({ milliseconds: pollIntervalMs });
    }

    throw new Error('WebView context not available within timeout.');
};

export const findElementByXPath = async ({
    serverUrl,
    sessionId,
    xPath,
}: FindElementByXPathProps): Promise<string> => {
    const payload = await appiumRequest({
        body: {
            using: 'xpath',
            value: xPath,
        },
        method: 'POST',
        path: `/session/${sessionId}/element`,
        serverUrl,
    });

    return parseElementId({ payload });
};

export const waitForElementByXPath = async ({
    serverUrl,
    sessionId,
    xPath,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementByXPathProps): Promise<string> => {
    const startedAt = Date.now();
    let lastError: unknown;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            return await findElementByXPath({
                serverUrl,
                sessionId,
                xPath,
            });
        } catch (error) {
            lastError = error;
            await sleep({ milliseconds: pollIntervalMs });
        }
    }

    throw new Error(`Element not found for XPath: ${xPath}. Last error: ${String(lastError)}`);
};

export const clickElementByXPath = async ({
    serverUrl,
    sessionId,
    xPath,
}: ClickElementByXPathProps): Promise<void> => {
    const elementId = await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath,
    });

    await appiumRequest({
        method: 'POST',
        path: `/session/${sessionId}/element/${elementId}/click`,
        serverUrl,
    });
};

export const clickElementByXPathWithJavaScript = async ({
    serverUrl,
    sessionId,
    xPath,
}: ClickElementByXPathWithJavaScriptProps): Promise<void> => {
    const elementId = await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath,
    });

    await appiumRequest({
        body: {
            args: [{ [elementIdKey]: elementId }],
            script: 'arguments[0].click();',
        },
        method: 'POST',
        path: `/session/${sessionId}/execute/sync`,
        serverUrl,
    });
};

export const typeIntoElementByXPath = async ({
    serverUrl,
    sessionId,
    xPath,
    text,
}: TypeIntoElementByXPathProps): Promise<void> => {
    const elementId = await waitForElementByXPath({
        serverUrl,
        sessionId,
        xPath,
    });

    await appiumRequest({
        body: {
            text,
            value: [...text],
        },
        method: 'POST',
        path: `/session/${sessionId}/element/${elementId}/value`,
        serverUrl,
    });
};

export const findElementByAndroidUiAutomator = async ({
    serverUrl,
    sessionId,
    selector,
}: FindElementByAndroidUiAutomatorProps): Promise<string> => {
    const payload = await appiumRequest({
        body: {
            using: '-android uiautomator',
            value: selector,
        },
        method: 'POST',
        path: `/session/${sessionId}/element`,
        serverUrl,
    });

    return parseElementId({ payload });
};

export const waitForElementByAndroidUiAutomator = async ({
    serverUrl,
    sessionId,
    selector,
    timeoutMs = defaultTimeoutMs,
}: WaitForElementByAndroidUiAutomatorProps): Promise<string> => {
    const startedAt = Date.now();
    let lastError: unknown;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            return await findElementByAndroidUiAutomator({
                selector,
                serverUrl,
                sessionId,
            });
        } catch (error) {
            lastError = error;
            await sleep({ milliseconds: pollIntervalMs });
        }
    }

    throw new Error(
        `Element not found for selector: ${selector}. Last error: ${String(lastError)}`,
    );
};

export const clickElementByAndroidUiAutomator = async ({
    serverUrl,
    sessionId,
    selector,
}: ClickElementByAndroidUiAutomatorProps): Promise<void> => {
    const elementId = await waitForElementByAndroidUiAutomator({
        selector,
        serverUrl,
        sessionId,
    });

    await appiumRequest({
        method: 'POST',
        path: `/session/${sessionId}/element/${elementId}/click`,
        serverUrl,
    });
};

export const tapByViewportRatio = async ({
    serverUrl,
    sessionId,
    xRatio,
    yRatio,
}: TapByViewportRatioProps): Promise<void> => {
    const rectPayload = await appiumRequest({
        method: 'GET',
        path: `/session/${sessionId}/window/rect`,
        serverUrl,
    });

    const rect = parseWindowRectResponse({ payload: rectPayload });

    const x = Math.round(rect.width * xRatio);
    const y = Math.round(rect.height * yRatio);

    await appiumRequest({
        body: {
            args: {
                x,
                y,
            },
            script: 'mobile: clickGesture',
        },
        method: 'POST',
        path: `/session/${sessionId}/execute/sync`,
        serverUrl,
    });
};

export const typeIntoElementByAndroidUiAutomator = async ({
    serverUrl,
    sessionId,
    selector,
    text,
}: TypeIntoElementByAndroidUiAutomatorProps): Promise<void> => {
    const elementId = await waitForElementByAndroidUiAutomator({
        selector,
        serverUrl,
        sessionId,
    });

    await appiumRequest({
        body: {
            text,
            value: [...text],
        },
        method: 'POST',
        path: `/session/${sessionId}/element/${elementId}/value`,
        serverUrl,
    });
};
