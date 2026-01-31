type Listener = () => void;

export interface Store<State> {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
    readonly setState: (partial: Partial<State>) => void;
}

export const createStore = <State>(initialState: State): Store<State> => {
    let state: State = initialState;

    const listeners = new Set<Listener>();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    const setState = (partial: Partial<State>) => {
        state = { ...state, ...partial };
        notify();
    };

    const getState = () => state;

    const subscribe = (listener: Listener) => {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    };

    return {
        getState,
        subscribe,
        setState,
    };
};

export type Selector<State, T> = (state: State) => T;
