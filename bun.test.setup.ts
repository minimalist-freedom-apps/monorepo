import { afterEach } from 'bun:test';
import { JSDOM } from 'jsdom';

if (typeof globalThis.document === 'undefined') {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://localhost:3000/',
    });

    Object.assign(globalThis, {
        window,
        document: window.document,
        Element: window.Element,
        HTMLElement: window.HTMLElement,
        SVGElement: window.SVGElement,
        ShadowRoot: window.ShadowRoot,
        Document: window.Document,
        Node: window.Node,
        Event: window.Event,
        MouseEvent: window.MouseEvent,
        KeyboardEvent: window.KeyboardEvent,
        CustomEvent: window.CustomEvent,
        DOMParser: window.DOMParser,
        Storage: window.Storage,
        localStorage: window.localStorage,
        sessionStorage: window.sessionStorage,
        getComputedStyle: window.getComputedStyle,
        requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
        cancelAnimationFrame: (id: number) => clearTimeout(id),
    });

    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: window.navigator,
    });
}

await import('@testing-library/jest-dom');
const { cleanup } = await import('@testing-library/react');

afterEach(() => {
    cleanup();
});
