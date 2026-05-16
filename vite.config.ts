import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  base: '/contraction-timer/',

  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
    },
  },

  plugins: [
    svelte(),

    VitePWA({
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: {
        name: 'Contraction Timer',
        short_name: 'Contractions',
        description: 'Labor contraction timer — tracks duration and intervals for your doctor',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/contraction-timer/',
        id: '/contraction-timer/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],

  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
