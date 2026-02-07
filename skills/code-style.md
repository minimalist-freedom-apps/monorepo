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
const calculateNewAmount = ({ isLoading }: { isLoading: boolean }) => { }
```