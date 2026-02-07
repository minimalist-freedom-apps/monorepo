## TypeScript

### Typed Object utilities

Never use `Object.keys`, `Object.values`, `Object.entries`, or `Object.fromEntries` directly — their return types are loosely typed (`string[]`, `unknown[]`, etc.).

Use the strongly-typed wrappers from `@minimalistic-apps/type-utils` instead:

| ❌ Avoid              | ✅ Use instead            |
| --------------------- | ------------------------- |
| `Object.keys(obj)`    | `typedObjectKeys(obj)`    |
| `Object.values(obj)`  | `typedObjectValues(obj)`  |
| `Object.entries(obj)` | `typedObjectEntries(obj)` |
| `Object.fromEntries(entries)` | `typedObjectFromEntries(entries)` |

```ts
import {
    typedObjectKeys,
    typedObjectValues,
    typedObjectEntries,
    typedObjectFromEntries,
} from '@minimalistic-apps/type-utils';

const config = { host: 'localhost', port: 3000 };

// keys: Array<"host" | "port"> (not string[])
const keys = typedObjectKeys(config);

// values: Array<string | number> (not unknown[])
const values = typedObjectValues(config);

// entries: ["host" | "port", string | number][] (not [string, unknown][])
const entries = typedObjectEntries(config);
```
