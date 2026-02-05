import React from 'react';
import type { Store } from './index';

type MapStateToProps<State, StateProps, OwnProps> = (
    state: State,
    ownProps: OwnProps,
) => StateProps;

type Connect<State> = <StateProps, OwnProps = object>(
    mapStateToProps: MapStateToProps<State, StateProps, OwnProps>,
) => (
    WrappedComponent: React.ComponentType<StateProps & OwnProps>,
) => React.ComponentType<OwnProps>;

type RenderFn<StateProps, OwnProps> = (
    props: StateProps & OwnProps,
) => React.ReactNode;

type MapStateToPropsSimple<State, StateProps> = (state: State) => StateProps;

type ComponentConnectFactory<State> = <StateProps, OwnProps = object>(
    mapStateToProps: MapStateToPropsSimple<State, StateProps>,
) => ComponentConnect<StateProps, OwnProps>;

type ComponentConnect<StateProps, OwnProps = object> = (
    render: RenderFn<StateProps, OwnProps>,
) => React.FC<OwnProps>;

export type ComponentConnectDep<StateProps, OwnProps = object> = {
    connect: ComponentConnect<StateProps, OwnProps>;
};

export type ConnectDep<State> = { connect: Connect<State> };

export const createConnect =
    <State,>(store: Store<State>): ComponentConnectFactory<State> =>
    <StateProps, OwnProps = object>(
        mapStateToProps: MapStateToPropsSimple<State, StateProps>,
    ): ComponentConnect<StateProps, OwnProps> =>
    (render: RenderFn<StateProps, OwnProps>) => {
        class Connected extends React.Component<OwnProps> {
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
                const stateProps = mapStateToProps(state);
                const props = { ...stateProps, ...this.props } as StateProps &
                    OwnProps;

                return render(props);
            }
        }

        return Connected as unknown as React.FC<OwnProps>;
    };
