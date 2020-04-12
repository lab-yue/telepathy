module.exports = {
  extends: ['@kalafina'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.'
  },
  rules: {
    "no-console": "off",
    "react-hooks/rules-of-hooks": "off"
  }
};