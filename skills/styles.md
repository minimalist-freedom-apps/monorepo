## Styles
Never use `style` and never use  `className` directly in the app, always tweak the components in the `@minimalist-apps/components` package to support your use case.

For layout use <Column> and <Row> components.
- Use `gap` for spacing.
- Vertical default gap is `12px`

## Design system
- Do not add props like `center` or `large`. Instead, create `align` and `size` props that offer more flexibility.