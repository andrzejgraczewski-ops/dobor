import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' — aplikacja ma działać zarówno pod adresem dkm.pl/dobor,
// w <iframe> na podstronie, jak i z pliku otwartego lokalnie (file://).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // jeden plik JS i jeden CSS — prostsze wystawienie na serwerze
        // i konieczne dla budowania wersji offline w jednym pliku
        // wynik budowania trafia do build/, żeby dist/assets/ zostało wyłącznie
        // na obrazy z public/ — na tym opiera się budowanie wersji offline
        manualChunks: undefined,
        entryFileNames: 'build/app-[hash].js',
        chunkFileNames: 'build/app-[hash].js',
        assetFileNames: 'build/[name]-[hash][extname]',
      },
    },
  },
});
