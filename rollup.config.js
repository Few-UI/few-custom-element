/* eslint-env es6, node */
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'public/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true
    },
    plugins: [
        resolve(), // plugin to use reference from node_modules
        commonjs(), // plugin to support commonjs module to browser usage
        postcss( {
            inject: false, //// not inject to global css
            // modules: true, //// use css module
            plugins: [] // plugin to support ES6 import css
        } ),
        production && terser() // minify, but only in production
    ]
};
