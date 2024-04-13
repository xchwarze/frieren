/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { analyzer } from 'vite-bundle-analyzer';
import path from 'path';

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')

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
      }
    },

    // for local dev
    server: {
      proxy: {
        '^/api/.*': {
          target: 'http://localhost:8000',
          rewrite: () => '/api-proxy.php',
          changeOrigin: true,
          secure: false,
        },
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
