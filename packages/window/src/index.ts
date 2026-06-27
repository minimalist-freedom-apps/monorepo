export type EventListener = () => void;
export type TimeoutId = number;
export type IntervalId = number;

export interface Window {
    readonly addEventListener: (event: string, listener: EventListener) => () => void;
    readonly setTimeout: (listener: EventListener, timeout: number) => TimeoutId;
    readonly clearTimeout: (timeoutId: TimeoutId) => void;
    readonly setInterval: (listener: EventListener, timeout: number) => IntervalId;
    readonly clearInterval: (intervalId: IntervalId) => void;
}

export interface WindowServiceDep {
    readonly window: Window;
}

export const createWindow = (): Window => ({
    addEventListener: (event: string, listener: EventListener) => {
        globalThis.window.addEventListener(event, listener);

        return () => globalThis.window.removeEventListener(event, listener);
    },
    setTimeout: (listener: EventListener, timeout: number) =>
        globalThis.window.setTimeout(listener, timeout),
    clearTimeout: (timeoutId: TimeoutId) => {
        globalThis.window.clearTimeout(timeoutId);
    },
    setInterval: (listener: EventListener, timeout: number) =>
        globalThis.window.setInterval(listener, timeout),
    clearInterval: (intervalId: IntervalId) => {
        globalThis.window.clearInterval(intervalId);
    },
});
