/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { defineConfig, loadEnv } from 'vite';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { analyzer } from 'vite-bundle-analyzer';
import path from 'path';
import packageJson from './package.json';

const FRIEREN_MODULE_PREFIX = 'FrierenModule';

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The input string to capitalize.
 * @return {string} The input string with the first letter capitalized.
 */
const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const LIB_NAME = ucfirst(env.VITE_LIB_NAME || packageJson.name);
  const COMMON_ALIAS = env.VITE_COMMON_ALIAS || '../frieren-front/src';

  const config = {
    plugins: [
      react(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        preventAssignment: true,
      }),
      alias({
        entries: [
          { find: 'react-bootstrap', replacement: path.resolve(__dirname, 'node_modules/react-bootstrap') },
          { find: 'prop-types', replacement: path.resolve(__dirname, 'node_modules/prop-types') },
          { find: 'react-toastify', replacement: path.resolve(__dirname, 'node_modules/react-toastify') },
        ]
      }),
    ],
    resolve: {
      alias: {
        '@module': path.resolve(__dirname, './src'),
        '@src': path.resolve(__dirname, COMMON_ALIAS),
        '@common': path.resolve(__dirname, COMMON_ALIAS),
      },
      dedupe: [
        // fix react-toastify duplication in build
        'react-toastify'
      ]
    },
    build: {
      lib: {
        name: `${FRIEREN_MODULE_PREFIX}${LIB_NAME}`,
        fileName: (format) => `module.${format}.js`,
        formats: ['umd'],
        entry: 'src/entry.jsx',
      },
      rollupOptions: {
        external: [
          '@hookform/resolvers',
          '@hookform/resolvers/yup',
          '@tanstack/react-query',
          'jotai',
          'jotai/utils',
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react-hook-form',
          'wouter',
          'yup'
        ],
        output: {
          globals: {
            '@hookform/resolvers': 'HookformResolvers',
            '@hookform/resolvers/yup': 'HookformResolversYup',
            '@tanstack/react-query': 'ReactQuery',
            'jotai': 'Jotai',
            'jotai/utils': 'JotaiUtils',
            'react': 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            'react-hook-form': 'ReactHookForm',
            'wouter': 'Wouter',
            'yup': 'Yup'
          }
        }
      }
    }
  };

  if (env.VITE_COMPRESSION_ENABLE === 'true') {
    config.plugins.push(
        compression({
          include: [/\.(js)$/, /\.(css)$/],
        }),
    );
  }

  if (env.VITE_ANALYZER_ENABLE === 'true') {
    config.plugins.push(
        analyzer()
    );
  }

  if (env.VITE_SOURCEMAP_ENABLE === 'true') {
    config.build.sourcemap = true;
  }

  if (env.VITE_MANUAL_CHUNKS_ENABLE === 'true') {
    config.build.rollupOptions.output.manualChunks = (id) => {
      if (id.includes('node_modules')) {
        return 'vendor';
      }

      return 'core';
    };
  }

  return config;
});
