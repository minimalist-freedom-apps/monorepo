const symbolDispose =
    (Symbol as unknown as { readonly dispose?: symbol }).dispose ?? Symbol('Symbol.dispose');

if ((Symbol as unknown as { readonly dispose?: symbol }).dispose === undefined) {
    Object.defineProperty(Symbol, 'dispose', {
        value: symbolDispose,
        writable: false,
        configurable: false,
    });
}

const symbolAsyncDispose =
    (Symbol as unknown as { readonly asyncDispose?: symbol }).asyncDispose ??
    Symbol('Symbol.asyncDispose');

if ((Symbol as unknown as { readonly asyncDispose?: symbol }).asyncDispose === undefined) {
    Object.defineProperty(Symbol, 'asyncDispose', {
        value: symbolAsyncDispose,
        writable: false,
        configurable: false,
    });
}

type DisposableLike = {
    readonly [key: symbol]: (() => void) | undefined;
};

type AsyncDisposableLike = {
    readonly [key: symbol]: (() => Promise<void> | void) | undefined;
};

class DisposableStackPolyfill {
    public disposed = false;
    #stack: Array<() => void> = [];

    defer(onDispose: () => void): void {
        if (this.disposed) {
            throw new ReferenceError('DisposableStack is already disposed');
        }

        this.#stack.push(onDispose);
    }

    use<T>(value: T): T {
        if (value == null) {
            return value;
        }

        const maybeDisposable = value as unknown as DisposableLike;
        const dispose = maybeDisposable[symbolDispose];

        if (typeof dispose === 'function') {
            this.defer(() => {
                dispose.call(value);
            });
        }

        return value;
    }

    adopt<T>(value: T, onDispose: (value: T) => void): T {
        if (this.disposed) {
            throw new ReferenceError('DisposableStack is already disposed');
        }

        this.defer(() => {
            onDispose(value);
        });

        return value;
    }

    move(): DisposableStackPolyfill {
        if (this.disposed) {
            throw new ReferenceError('DisposableStack is already disposed');
        }

        const next = new DisposableStackPolyfill();
        next.#stack = this.#stack;
        this.#stack = [];
        this.disposed = true;

        return next;
    }

    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.disposed = true;

        let firstError: unknown;

        for (let index = this.#stack.length - 1; index >= 0; index -= 1) {
            try {
                this.#stack[index]?.();
            } catch (error) {
                firstError ??= error;
            }
        }

        this.#stack = [];

        if (firstError !== undefined) {
            throw firstError;
        }
    }

    [symbolDispose](): void {
        this.dispose();
    }
}

class AsyncDisposableStackPolyfill {
    public disposed = false;
    #stack: Array<() => Promise<void> | void> = [];

    defer(onDispose: () => Promise<void> | void): void {
        if (this.disposed) {
            throw new ReferenceError('AsyncDisposableStack is already disposed');
        }

        this.#stack.push(onDispose);
    }

    use<T>(value: T): T {
        if (value == null) {
            return value;
        }

        const maybeAsyncDisposable = value as unknown as AsyncDisposableLike;
        const asyncDispose = maybeAsyncDisposable[symbolAsyncDispose];

        if (typeof asyncDispose === 'function') {
            this.defer(async () => {
                await asyncDispose.call(value);
            });

            return value;
        }

        const maybeDisposable = value as unknown as DisposableLike;
        const dispose = maybeDisposable[symbolDispose];

        if (typeof dispose === 'function') {
            this.defer(() => {
                dispose.call(value);
            });
        }

        return value;
    }

    adopt<T>(value: T, onDispose: (value: T) => Promise<void> | void): T {
        if (this.disposed) {
            throw new ReferenceError('AsyncDisposableStack is already disposed');
        }

        this.defer(() => onDispose(value));

        return value;
    }

    move(): AsyncDisposableStackPolyfill {
        if (this.disposed) {
            throw new ReferenceError('AsyncDisposableStack is already disposed');
        }

        const next = new AsyncDisposableStackPolyfill();
        next.#stack = this.#stack;
        this.#stack = [];
        this.disposed = true;

        return next;
    }

    async disposeAsync(): Promise<void> {
        if (this.disposed) {
            return;
        }

        this.disposed = true;

        let firstError: unknown;

        for (let index = this.#stack.length - 1; index >= 0; index -= 1) {
            try {
                await this.#stack[index]?.();
            } catch (error) {
                firstError ??= error;
            }
        }

        this.#stack = [];

        if (firstError !== undefined) {
            throw firstError;
        }
    }

    [symbolAsyncDispose](): Promise<void> {
        return this.disposeAsync();
    }
}

const globalObject = globalThis as {
    DisposableStack?: typeof DisposableStackPolyfill;
    AsyncDisposableStack?: typeof AsyncDisposableStackPolyfill;
};

if (globalObject.DisposableStack === undefined) {
    Object.defineProperty(globalObject, 'DisposableStack', {
        value: DisposableStackPolyfill,
        writable: true,
        configurable: true,
    });
}

if (globalObject.AsyncDisposableStack === undefined) {
    Object.defineProperty(globalObject, 'AsyncDisposableStack', {
        value: AsyncDisposableStackPolyfill,
        writable: true,
        configurable: true,
    });
}
