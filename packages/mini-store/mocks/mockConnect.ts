import type { ComponentConnect } from '../src/connect.js';

export const mockConnect =
    <StateProps, OwnProps = object>(
        stateProps: StateProps,
    ): ComponentConnect<StateProps, OwnProps> =>
    render =>
    ownProps =>
        render({ ...stateProps, ...ownProps });
