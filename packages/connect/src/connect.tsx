import type React from 'react';
import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

export interface Subscribable<State> {
    readonly getState: () => State;
    readonly subscribe: (listener: Listener) => () => void;
}

type SubscribableRecord = Readonly<Record<string, Subscribable<unknown>>>;

type StoreStates<Stores extends SubscribableRecord> = {
    readonly [K in keyof Stores]: Stores[K] extends Subscribable<infer S>
        ? S
        : never;
};

type NoOwnProps = Record<string, never>;
export type Connected<OwnProps = NoOwnProps> = React.FC<OwnProps>;

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

    const getStates = (): StoreStates<Stores> => {
        const states: Record<string, unknown> = {};

        for (const [key, s] of storeEntries) {
            states[key] = s.getState();
        }

        return states as StoreStates<Stores>;
    };

    const connect = (
        render: (...args: readonly unknown[]) => React.ReactNode,
        mapStateToProps: (states: StoreStates<Stores>) => unknown,
        deps?: unknown,
    ): React.FC<unknown> => {
        const ConnectedComponent: React.FC<unknown> = ownProps => {
            const getSnapshot = useCallback(
                () => mapStateToProps(getStates()),
                [],
            );
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
