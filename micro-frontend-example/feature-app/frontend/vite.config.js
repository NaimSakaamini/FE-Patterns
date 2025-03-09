import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'featureApp',
      filename: 'assets/remoteEntry.js',
      exposes: {
        './CategoryManager': './src/components/CategoryManager.jsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          eager: true
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          eager: true
        },
        'react-redux': {
          singleton: true,
          requiredVersion: false,
          eager: true
        },
        redux: {
          singleton: true,
          requiredVersion: false,
          eager: true
        },
        '@reduxjs/toolkit': {
          singleton: true,
          requiredVersion: false,
          eager: true
        },
      },
    }),
  ],
  resolve: {
    alias: {
      // Add alias for the store to avoid import errors
      'mainApp/store': path.resolve(__dirname, './src/store/index.js'),
    },
  },
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['mainApp/store']
    }
  },
}); 