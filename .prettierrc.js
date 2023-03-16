module.exports = {
  printWidth: 100,
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'all',
  overrides: [{ files: '.prettierrc', options: { parser: 'json' } }],
  plugins: [
    require('@trivago/prettier-plugin-sort-imports'),
  ],
  importOrder: ['reflect-metadata', '<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'classProperties', 'decorators-legacy'],
};
