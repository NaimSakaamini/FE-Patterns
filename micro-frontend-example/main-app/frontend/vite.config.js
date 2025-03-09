import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mainApp',
      remotes: {
        featureApp: 'http://localhost:5001/assets/assets/remoteEntry.js',
      },
      exposes: {
        './store': './src/store/index.js',
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
  server: {
    port: 5000,
    strictPort: true,
    cors: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
}); 