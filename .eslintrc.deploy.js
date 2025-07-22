module.exports = {
  extends: ['./eslint.config.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    'no-useless-escape': 'warn'
  }
};
