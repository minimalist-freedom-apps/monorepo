## Code Style

### Brackets
- Always wrap code in brackets, even if they are not strictly necessary

**Bad**
```tsx
if (isLoading) return null;
```

**Good**
```tsx
if (isLoading) {
    return null;
}
```

### Named arguments
- Always use named arguments for any function.

**Bad**
```tsx
const calculateNewAmount = (isLoading: boolean) => { }
```

**Good**
```tsx
interface CalculateNewAmountProps {
    readonly isLoading: boolean;
}

const calculateNewAmount = ({ isLoading }: CalculateNewAmountProps) => { }
```

### Extract inline object parameter types
- Never define object types inline in function parameters. Always extract them into a named interface (e.g. `FunctionNameProps`).

**Bad**
```tsx
const writePackageJson = ({
    dir,
    content,
}: {
    readonly dir: string;
    readonly content: Record<string, unknown>;
}): void => { }
```

**Good**
```tsx
interface WritePackageJsonProps {
    readonly dir: string;
    readonly content: Record<string, unknown>;
}

const writePackageJson = ({
    dir,
    content,
}: WritePackageJsonProps): void => { }
```