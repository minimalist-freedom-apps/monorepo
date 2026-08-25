import { registerHooks } from 'node:module';
import { JSDOM } from 'jsdom';
import { createElement, Fragment } from 'react';

registerHooks({
    load: (url, context, nextLoad) =>
        url.endsWith('.css')
            ? {
                  format: 'module',
                  shortCircuit: true,
                  source: 'export default {};',
              }
            : nextLoad(url, context),
});

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost',
});
const nativeLockManager = globalThis.navigator.locks;

Object.defineProperty(dom.window.navigator, 'locks', {
    configurable: true,
    value: nativeLockManager,
});

interface InstallGlobalProps {
    readonly name: string;
    readonly value: unknown;
}

const installGlobal = ({ name, value }: InstallGlobalProps): void => {
    Object.defineProperty(globalThis, name, {
        configurable: true,
        writable: true,
        value,
    });
};

installGlobal({ name: 'window', value: dom.window });
installGlobal({ name: 'document', value: dom.window.document });
installGlobal({ name: 'navigator', value: dom.window.navigator });
installGlobal({ name: 'Node', value: dom.window.Node });
installGlobal({ name: 'Element', value: dom.window.Element });
installGlobal({ name: 'HTMLElement', value: dom.window.HTMLElement });
installGlobal({ name: 'HTMLInputElement', value: dom.window.HTMLInputElement });
installGlobal({ name: 'HTMLButtonElement', value: dom.window.HTMLButtonElement });
installGlobal({ name: 'Event', value: dom.window.Event });
installGlobal({ name: 'CustomEvent', value: dom.window.CustomEvent });
installGlobal({ name: 'MouseEvent', value: dom.window.MouseEvent });
installGlobal({ name: 'KeyboardEvent', value: dom.window.KeyboardEvent });
installGlobal({ name: 'MutationObserver', value: dom.window.MutationObserver });
installGlobal({ name: 'getComputedStyle', value: dom.window.getComputedStyle.bind(dom.window) });
installGlobal({ name: 'localStorage', value: dom.window.localStorage });
installGlobal({ name: 'sessionStorage', value: dom.window.sessionStorage });
installGlobal({ name: 'IS_REACT_ACT_ENVIRONMENT', value: true });
installGlobal({ name: 'React', value: { createElement, Fragment } });

for (const name of Object.getOwnPropertyNames(dom.window)) {
    if (name in globalThis) {
        continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(dom.window, name);

    if (descriptor !== undefined) {
        Object.defineProperty(globalThis, name, descriptor);
    }
}

class TestResizeObserver implements ResizeObserver {
    readonly disconnect = (): void => undefined;
    readonly observe = (): void => undefined;
    readonly unobserve = (): void => undefined;
}

installGlobal({ name: 'ResizeObserver', value: TestResizeObserver });
