## Dependency injection

Follow Evolu's convention-based DI approach without frameworks:

### Define dependencies 
```ts
type MyServiceDeps = TimeDep & OtherDep;
```

### Define service type (prefer interface)

```ts
type MyService = (eventTimestamp: number) => number;
```

### Define dependency interfaces

```ts
export type MyServiceDep = { myService: MyService }
```

### Use currying for functions with dependencies

```ts
const createMyService =
    (deps: MyServiceDeps): MyService =>
    ({ param1, param2 }): number => {
        const currentTime = deps.time.now();
        const eventTimestamp = depends.other.getEventTimestamp(param1, param2);

        return eventTimestamp - currentTime;
    };
```

### 3. Create factory functions

```ts
export const createTime = (): Time => ({
    now: () => Date.now(),
});
```

### 4. Composition root pattern
Dependency composition happens in the app's entry point (composition root)


```ts
export const createCompositionRoot = (): Deps => {
    const createTime = createTime();

    const myService = createMyService({
        time: createTime(),
        other: createOtherService({otherDep, someOtherDep}),
    });
}
```

Composition root MUST BE synchronous!

### Never create services inside other services

All service creation must happen in the composition root. Never call `createXxx` inside another service factory.

**Exception**: Create services inside other services only when a parameter needed for creation is not known at composition root time (e.g., runtime values, user input).

### Fetch state inside services — never pass it as a parameter

When a service needs current state, it must read it from an injected getter (e.g., `getOrderedCurrencies`, `store.getState()`), not accept it as a function parameter. State passed from a caller (e.g., a React component) may be stale by the time the service executes, causing race conditions.
