export const mockConnect =
    <StateProps>(stateProps: StateProps) =>
    <OwnProps = object>(
        render: (...args: readonly unknown[]) => React.ReactNode,
        _mapStateToProps: unknown,
        deps?: unknown,
    ): React.FC<OwnProps> =>
        ((ownProps: OwnProps) => {
            const props = {
                ...(stateProps as object),
                ...(ownProps as object),
            };

            if (deps !== undefined) {
                return (
                    render as (
                        deps: unknown,
                        props: StateProps & OwnProps,
                    ) => React.ReactNode
                )(deps, props as StateProps & OwnProps);
            }

            return (
                render as (props: StateProps & OwnProps) => React.ReactNode
            )(props as StateProps & OwnProps);
        }) as React.FC<OwnProps>;
