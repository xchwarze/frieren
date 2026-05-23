import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import babel from 'vite-plugin-babel';
import path from 'path';

export default defineConfig({
    plugins: [
        babel({
            include: /node_modules[\\/]ttyd[\\/].*\.tsx?$/,
            babelConfig: {
                presets: [
                    '@babel/preset-typescript',
                ],
                plugins: [
                    ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
                ],
            },
        }),
        dts({
            rollupTypes: true,
        }),
    ],
    resolve: {
        alias: {
            'ttyd': path.resolve(__dirname, 'node_modules/ttyd'),
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index',
        },
        cssCodeSplit: false,
        sourcemap: false,
        minify: false,
    },
});
