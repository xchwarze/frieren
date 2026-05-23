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

export default defineConfig(({ mode }) => {
  const modeMap = { production: 'prod', development: 'dev' };
  const resolvedMode = modeMap[mode] || mode;
  const env = Object.assign(
      process.env,
      loadEnv(resolvedMode, `${process.cwd()}/config`)
  );

  const config = {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        // eslint-disable-next-line no-undef
        '@src': path.resolve(__dirname, './src'),
        // eslint-disable-next-line no-undef
        '@module': path.resolve(__dirname, './src'),
        // eslint-disable-next-line no-undef
        '@frieren/terminal-core': path.resolve(__dirname, '../frieren-terminal/dist'),
      }
    },

    // for build
    cssCodeSplit: false,
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        }
      },
    }
  };

  // for local dev
  if (env.VITE_DEV_PROXY_TARGET) {
    config.server = {
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
      }
    };
  }

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
