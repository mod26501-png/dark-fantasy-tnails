import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.DARK_FANTASY_API_KEY || env.DARK_FANTASY_KEY || env.GEMINI_API_KEY || env.API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.DARK_FANTASY_API_KEY || env.DARK_FANTASY_KEY || env.GEMINI_API_KEY || env.API_KEY),
        'process.env.DARK_FANTASY_API_KEY': JSON.stringify(env.DARK_FANTASY_API_KEY || env.DARK_FANTASY_KEY || env.FREE_DARK_FANTASY_API_KEY || env.FANTASY_API_KEY || env.GEMINI_API_KEY || env.API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
      },
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html')
          }
        }
      }
    };
});
