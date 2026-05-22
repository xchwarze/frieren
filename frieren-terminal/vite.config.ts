import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
    plugins: [
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
