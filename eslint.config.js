const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'no-console': 'off',
    'ts/ban-ts-comment': 'off',
    'unused-imports/no-unused-vars': 'warn',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'no-alert': 'off',
  },
})
