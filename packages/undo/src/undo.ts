export interface UndoState<T> {
    readonly past: ReadonlyArray<T>;
    readonly present: T;
    readonly future: ReadonlyArray<T>;
}

export const createUndoState = <T>(initial: T): UndoState<T> => ({
    past: [],
    present: initial,
    future: [],
});

export const canUndo = <T>({ state }: { readonly state: UndoState<T> }): boolean =>
    state.past.length > 0;

export const canRedo = <T>({ state }: { readonly state: UndoState<T> }): boolean =>
    state.future.length > 0;

export const write = <T>({
    state,
    next,
}: {
    readonly state: UndoState<T>;
    readonly next: T;
}): UndoState<T> => {
    if (Object.is(state.present, next)) {
        return state;
    }

    return {
        past: [...state.past, state.present],
        present: next,
        future: [],
    };
};

export const undo = <T>({ state }: { readonly state: UndoState<T> }): UndoState<T> => {
    if (state.past.length === 0) {
        return state;
    }

    const previousIndex = state.past.length - 1;
    const previous = state.past[previousIndex];

    return {
        past: state.past.slice(0, previousIndex),
        present: previous,
        future: [state.present, ...state.future],
    };
};

export const redo = <T>({ state }: { readonly state: UndoState<T> }): UndoState<T> => {
    if (state.future.length === 0) {
        return state;
    }

    const [next, ...remainingFuture] = state.future;

    return {
        past: [...state.past, state.present],
        present: next,
        future: remainingFuture,
    };
};
