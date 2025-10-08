module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12
    },
    rules: {
        'complexity': ['error', 7], // Max cyclomatic complexity
        'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
        'max-depth': ['error', 3],
        'max-params': ['error', 4],
        'no-console': 'off', // We use logger
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
}

