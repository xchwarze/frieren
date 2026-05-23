/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { analyzer } from 'vite-bundle-analyzer';
import path from 'path';
import packageJson from './package.json';

const FRIEREN_MODULE_PREFIX = 'FrierenModule';

const EXTERNAL_DEPS = [
  '@hookform/resolvers',
  '@hookform/resolvers/yup',
  '@tanstack/react-query',
  'jotai',
  'jotai/utils',
  'prop-types',
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-bootstrap',
  'react-hook-form',
  'react-toastify',
  'wouter',
  'yup'
];

const GLOBALS_MAP = {
  '@hookform/resolvers': 'HookformResolvers',
  '@hookform/resolvers/yup': 'HookformResolversYup',
  '@tanstack/react-query': 'ReactQuery',
  'jotai': 'Jotai',
  'jotai/utils': 'JotaiUtils',
  'prop-types': 'PropTypes',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'react/jsx-runtime': 'jsxRuntime',
  'react-bootstrap': 'ReactBootstrap',
  'react-hook-form': 'ReactHookForm',
  'react-toastify': 'ReactToastify',
  'wouter': 'Wouter',
  'yup': 'Yup'
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The input string to capitalize.
 * @return {string} The input string with the first letter capitalized.
 */
const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Checks if a module ID should be treated as external (provided by window globals).
 * Handles react-bootstrap subpath imports like react-bootstrap/Button.
 *
 * @param {string} id - The module ID to check.
 * @return {boolean} Whether the module is external.
 */
const isExternal = (id) => (
    EXTERNAL_DEPS.includes(id) || id.startsWith('react-bootstrap/')
);

/**
 * Resolves a module ID to its window global name for UMD builds.
 * Maps react-bootstrap subpaths to dot notation (e.g., react-bootstrap/Button → ReactBootstrap.Button).
 *
 * @param {string} id - The module ID to resolve.
 * @return {string} The global variable name.
 */
const resolveGlobal = (id) => {
  if (GLOBALS_MAP[id]) {
    return GLOBALS_MAP[id];
  }

  if (id.startsWith('react-bootstrap/')) {
    return `ReactBootstrap.${id.replace('react-bootstrap/', '')}`;
  }
};

export default defineConfig(({ mode }) => {
  const modeMap = { production: 'prod', development: 'dev' };
  const resolvedMode = modeMap[mode] || mode;
  const env = Object.assign(
      process.env,
      loadEnv(resolvedMode, `${process.cwd()}/config`)
  );
  const LIB_NAME = ucfirst(env.VITE_LIB_NAME || packageJson.name);
  const COMMON_ALIAS = env.VITE_COMMON_ALIAS || '../frieren-front/src';

  const config = {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@module': path.resolve(__dirname, './src'),
        '@src': path.resolve(__dirname, COMMON_ALIAS),
        '@common': path.resolve(__dirname, COMMON_ALIAS),
      },
    },
    build: {
      lib: {
        name: `${FRIEREN_MODULE_PREFIX}${LIB_NAME}`,
        fileName: (format) => `module.${format}.js`,
        formats: ['umd'],
        entry: 'src/entry.jsx',
      },
      rollupOptions: {
        external: isExternal,
        output: {
          globals: resolveGlobal,
        }
      }
    }
  };

  if (env.VITE_COMPRESSION_ENABLE === 'true') {
    const compressOptions = {
      include: [/\.(js)$/, /\.(css)$/],
      algorithms: ['gzip'],
    }
    if (mode === 'release') {
      compressOptions.filename = '[path][base]';
      compressOptions.deleteOriginalAssets = true;
    }

    config.plugins.push(
        compression(compressOptions),
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
