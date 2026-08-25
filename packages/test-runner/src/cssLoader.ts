import { registerHooks } from 'node:module';

registerHooks({
    load: (url, context, nextLoad) =>
        url.endsWith('.css')
            ? {
                  format: 'module',
                  shortCircuit: true,
                  source: 'export default {};',
              }
            : nextLoad(url, context),
});
