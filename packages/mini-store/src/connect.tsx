import React from 'react';
import type { Store } from './store';

export type Connect<State> = {
    <RenderProps, StateProps>(
        render: (props: RenderProps) => React.ReactNode,
        mapStateToProps: (state: State) => StateProps,
    ): React.FC<Omit<RenderProps, keyof StateProps>>;

    <Deps, RenderProps, StateProps>(
        render: (deps: Deps, props: RenderProps) => React.ReactNode,
        mapStateToProps: (state: State) => StateProps,
        deps: Deps,
    ): React.FC<Omit<RenderProps, keyof StateProps>>;
};

export const createConnect = <State,>(store: Store<State>): Connect<State> => {
    const connect = (
        render: (...args: readonly unknown[]) => React.ReactNode,
        mapStateToProps: (state: State, ownProps: unknown) => unknown,
        deps?: unknown,
    ): React.FC<unknown> => {
        class Connected extends React.Component<unknown> {
            private unsubscribe: () => void = () => {};

            componentDidMount() {
                this.unsubscribe = store.subscribe(() => {
                    this.forceUpdate();
                });
            }

            componentWillUnmount() {
                this.unsubscribe();
            }

            render() {
                const state = store.getState();
                const stateProps = mapStateToProps(state, this.props);
                const props = {
                    ...(stateProps as object),
                    ...(this.props as object),
                };

                if (deps !== undefined) {
                    return render(deps, props);
                }

                return render(props);
            }
        }

        return Connected as unknown as React.FC<unknown>;
    };

    return connect as unknown as Connect<State>;
};
