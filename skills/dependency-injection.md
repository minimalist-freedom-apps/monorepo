# Dependency injection

Some parts of the codebase use the Dependency Injection (DI) pattern. Instead of importing dependencies directly, pass them to the service as parameters. This allows better testability and separation of concerns.

## Skill boundaries

Use this skill mainly for packages that directly mention this skill.

## Service definition standard

The unified pattern for defining services is as follows.

Define in this order for consistency:

### 1: Service dependencies

Use the same key (`serviceName`) everywhere. This is important so `Dep`, `Deps`, and composition root wiring stay consistent.

```ts
export type ServiceNameDeps = OtherServiceDep | AnotherServiceDep;
```

### 2. Service shape:

```ts
export type ServiceParams = {
    id: string;
    // ...
};

// Usually a function, but it can also be an object with multiple methods.
export type ServiceName = (params: ServiceParams) => ServiceResult;
```

### 3. Dependency shape for other services:

```ts
export type ServiceNameDeps = {
    serviceName: ServiceName;
};
```

### 4. Service factory:

Do not repeat `ServiceParams` in factory (`(params)` only). It is inferred from `ServiceName`.

Service factory:

File shall be named: `createServiceName.ts`.

```ts
export const createServiceName =
    (deps: ServiceNameDeps): ServiceName =>
    params => {
        // params is inferred from ServiceName type
        return deps.serviceName(params);
    };
```

## Composition root

This is the place where the tree of dependencies is created and wired together.

- We have top-level composition roots for Desktop, Web, and Native.
- There may be some module/package level composition roots. Think of them as simply another
  service factory, but the service in this case is the whole module/package.

Composition root:

```ts
// Composition root may have its own dependencies
type CompositionRootDeps = ADep;

export const createCompositionRoot = (deps: CompositionRootDeps) => {
    const otherService = createOtherService(deps);
    const serviceName = createServiceName({ otherService });

    return {
        serviceName, // expose only `serviceName`; `otherService` is module-private in this case
    };
};
```

Composition root MUST BE synchronous!

### Never create services inside other services

All service creation must happen in the composition root. Never call `createXxx` inside another service factory.

**Exception**: Create services inside other services only when a parameter needed for creation is not known at composition root time (e.g., runtime values, user input).

### Fetch state inside services — never pass it as a parameter

When a service needs current state, it must read it from an injected getter (e.g., `getOrderedCurrencies`, `store.getState()`), not accept it as a function parameter. State passed from a caller (e.g., a React component) may be stale by the time the service executes, causing race conditions.