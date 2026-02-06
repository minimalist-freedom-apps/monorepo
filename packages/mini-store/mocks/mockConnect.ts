export const mockConnect =
    <StateProps>(stateProps: StateProps) =>
    <OwnProps = object>(
        render: (...args: readonly unknown[]) => React.ReactNode,
        _mapStateToProps: unknown,
        deps?: unknown,
    ): React.FC<OwnProps> =>
        ((ownProps: OwnProps) => {
            const props = {
                ...stateProps,
                ...ownProps,
            } as StateProps & OwnProps;

            if (deps !== undefined) {
                return (
                    render as (
                        deps: unknown,
                        props: StateProps & OwnProps,
                    ) => React.ReactNode
                )(deps, props);
            }

            return (
                render as (props: StateProps & OwnProps) => React.ReactNode
            )(props);
        }) as React.FC<OwnProps>;
