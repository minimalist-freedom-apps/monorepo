/**
 * The utils that provides a conversion from selector to a getter-service.
 *
 * Simply wrap any selector with this + provide getState callback,
 * and you get a service, ready to be used in the Dependency Injection.
 */
export const toGetter =
    // biome-ignore lint/suspicious/noExplicitAny: not relevant
        <TReturn, TParams extends any[], TState = any>(
            getState: () => TState,
            selector: (state: TState, ...params: TParams) => TReturn,
        ) =>
        (...params: TParams): TReturn =>
            selector(getState(), ...params);
