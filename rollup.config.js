import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

let base = {
    input: './src/index.ts',
    output: {
        format: 'umd',
        name: 'main',
        globals: {
            "react": 'React',
            "react-dom": 'ReactDOM',
        }
    },
    plugins: [
        resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] }),
        commonjs({
            include: /node_modules/
        }),
        babel({
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            presets: ["@babel/env", "@babel/preset-react"],
            babelHelpers: 'bundled'
        }),
    ],
    external: [
        'react', 'react-dom'
    ]
};

let build = Object.assign({...base}, {
    output: { file: './build/index.js' },
    plugins: [...base.plugins, typescript({ tsconfig: `./tsconfig.json` })]
});
let dist = Object.assign({...base}, {
    output: { file: './dist/index.js', plugins: [terser()] },
    plugins: [...base.plugins, typescript({
        tsconfig: `./tsconfig.json`,
        declaration: true,
        declarationMap: true,
        outDir: './dist'
    })]
});

export default [build, dist];