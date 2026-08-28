// @ts-check
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.cjs'],
  env: {
    node: true,
    browser: false,
  },
  rules: {
    'no-console': 'off', // Allow console in server-side code
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
