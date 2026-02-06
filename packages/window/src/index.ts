export type EventListener = () => void;

export interface Window {
    readonly addEventListener: (
        event: string,
        listener: EventListener,
    ) => () => void;
}

export interface WindowServiceDep {
    readonly window: Window;
}

export const createWindow = (): Window => ({
    addEventListener: (event: string, listener: EventListener) => {
        window.addEventListener(event, listener);

        return () => window.removeEventListener(event, listener);
    },
});
