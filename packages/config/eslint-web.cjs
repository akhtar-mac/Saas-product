// @ts-check
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  rules: {
    // Web-specific overrides: JSX transforms, browser APIs, etc.
    'no-restricted-globals': [
      'error',
      { name: 'event', message: 'Use local parameter instead.' },
    ],
  },
};
