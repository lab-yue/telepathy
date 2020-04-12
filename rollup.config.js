import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const name = `neon`;

export default {
  input: 'src/index.ts',
  output: ['cjs', 'es', 'iife'].map((format) => ({
    file: path.resolve(`dist/index.${format}.js`),
    format,
    name
  })),
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
    terser()
  ]
};
