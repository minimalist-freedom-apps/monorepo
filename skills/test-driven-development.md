## Test-driven development

- Write a failing test before implementing a new feature or fixing a bug
- Keep test code cleaner than production code — good tests let you refactor production code; nothing protects messy tests
- **MANDATORY: Every new service, function, or module MUST have a corresponding test file** — never create production code without test coverage. No exceptions.
- When creating a `createX` factory or any service, create `X.test.ts` alongside it before considering the task complete
- Untested code is unfinished code — a feature is not done until its tests exist and pass