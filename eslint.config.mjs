import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
    { ignores: ['build/**', 'node_modules/**'] },
    {
        files: ['src/**/*.{js,jsx}'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser },
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: { react, 'react-hooks': reactHooks },
        settings: { react: { version: 'detect' } },
        rules: {
            ...js.configs.recommended.rules,
            // Senza queste due regole ESLint non vede gli identificatori usati
            // dentro il JSX e li segnala tutti come non utilizzati.
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            // Le dipendenze sbagliate negli hook sono la fonte piu comune di bug
            // silenziosi in questa applicazione (liste che non si aggiornano).
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            eqeqeq: ['warn', 'smart'],
            'prefer-const': 'warn',
        },
    },
    {
        // I test girano con Vitest: le sue globali non esistono nel codice applicativo.
        files: ['src/**/*.test.js'],
        languageOptions: {
            globals: { describe: 'readonly', expect: 'readonly', test: 'readonly', vi: 'readonly' },
        },
    },
    {
        // Gli script di supporto girano in Node, non nel browser.
        files: ['scripts/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: { ...globals.node },
        },
        rules: { ...js.configs.recommended.rules },
    },
    {
        // I file di configurazione sono moduli ES, non CommonJS.
        files: ['*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: { ...js.configs.recommended.rules },
    },
];
