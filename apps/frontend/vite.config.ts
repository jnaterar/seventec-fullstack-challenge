import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Aumentar el límite de advertencia de tamaño de chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  
  server: {
    port: 4200,
    host: 'localhost',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
  ],
  
  // Configuración para manejar módulos de Node.js
  define: {
    'process.env': {}
  },
  
  // Configuración de resolución
  resolve: {
    alias: [
      // Mapear módulos de Node.js
      { find: 'path', replacement: 'path-browserify' },
      // Asegurar que las rutas se resuelvan correctamente
      { find: '@', replacement: resolve(__dirname, 'src') }
    ]
  },
});
