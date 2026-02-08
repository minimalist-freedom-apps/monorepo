import type React from 'react';
import { useCallback, useRef, useSyncExternalStore } from 'react';

type Listener = () => void;

export interface Subscribable<State> {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
}

type SubscribableRecord = Readonly<Record<string, Subscribable<unknown>>>;

type StoreStates<Stores extends SubscribableRecord> = {
    readonly [K in keyof Stores]: Stores[K] extends Subscribable<infer S> ? S : never;
};

export type Connect<States> = {
    <RenderProps, StateProps>(
        render: (props: RenderProps) => React.ReactNode,
        mapStateToProps: (states: States) => StateProps,
    ): React.FC<Omit<RenderProps, keyof StateProps>>;

    <Deps, RenderProps, StateProps>(
        render: (deps: Deps, props: RenderProps) => React.ReactNode,
        mapStateToProps: (states: States) => StateProps,
        deps: Deps,
    ): React.FC<Omit<RenderProps, keyof StateProps>>;
};

export const createConnect = <Stores extends SubscribableRecord>(
    stores: Stores,
): Connect<StoreStates<Stores>> => {
    const storeEntries = Object.entries(stores);

    const subscribe = (callback: Listener) => {
        const unsubscribes = storeEntries.map(([, s]) => s.subscribe(callback));

        return () => {
            for (const unsubscribe of unsubscribes) {
                unsubscribe();
            }
        };
    };

    const connect = (
        render: (...args: readonly unknown[]) => React.ReactNode,
        mapStateToProps: (states: StoreStates<Stores>) => unknown,
        deps?: unknown,
    ): React.FC<unknown> => {
        const ConnectedComponent: React.FC<unknown> = ownProps => {
            const cacheRef = useRef<
                | {
                      readonly storeStates: ReadonlyArray<unknown>;
                      readonly mapped: unknown;
                  }
                | undefined
            >(undefined);

            const getSnapshot = useCallback(() => {
                const currentStoreStates = storeEntries.map(([, s]) => s.getState());

                if (
                    cacheRef.current !== undefined &&
                    currentStoreStates.every((state, i) =>
                        Object.is(state, cacheRef.current?.storeStates[i]),
                    )
                ) {
                    return cacheRef.current.mapped;
                }

                const states: Record<string, unknown> = {};

                for (let i = 0; i < storeEntries.length; i++) {
                    states[storeEntries[i][0]] = currentStoreStates[i];
                }

                const mapped = mapStateToProps(states as StoreStates<Stores>);

                cacheRef.current = { storeStates: currentStoreStates, mapped };

                return mapped;
            }, []);

            const stateProps = useSyncExternalStore(subscribe, getSnapshot);
            const props = {
                ...(stateProps as object),
                ...(ownProps as object),
            };

            return deps !== undefined ? render(deps, props) : render(props);
        };

        return ConnectedComponent;
    };

    return connect as unknown as Connect<StoreStates<Stores>>;
};
