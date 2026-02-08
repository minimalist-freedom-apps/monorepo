import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                projectService: true,
            },
        },
        plugins: {
            '@stylistic': stylistic,
            '@typescript-eslint': tseslint,
        },
        rules: {
            '@typescript-eslint/strict-boolean-expressions': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            'no-restricted-properties': [
                'error',
                {
                    object: 'Object',
                    property: 'keys',
                    message:
                        'Use typedObjectKeys from @packages/type-utils instead for type-safe keys.',
                },
                {
                    object: 'Object',
                    property: 'values',
                    message:
                        'Use typedObjectValues from @packages/type-utils instead for type-safe values.',
                },
                {
                    object: 'Object',
                    property: 'entries',
                    message:
                        'Use typedObjectEntries from @packages/type-utils instead for type-safe entries.',
                },
                {
                    object: 'Object',
                    property: 'fromEntries',
                    message:
                        'Use typedObjectFromEntries from @packages/type-utils instead for type-safe fromEntries.',
                },
            ],
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: '*', next: 'if' },
                { blankLine: 'always', prev: '*', next: 'while' },
                { blankLine: 'always', prev: '*', next: 'for' },
                { blankLine: 'always', prev: '*', next: 'switch' },
                { blankLine: 'always', prev: '*', next: 'try' },
            ],
        },
    },
    {
        files: ['**/type-utils/src/typedObject.ts'],
        rules: {
            'no-restricted-properties': 'off',
        },
    },
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.turbo/**',
            '**/android/**',
            '**/capacitor.config.ts',
        ],
    },
];
