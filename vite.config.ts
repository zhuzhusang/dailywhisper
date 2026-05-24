import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  // Dynamically determine the base path for GitHub Pages deployment.
  // During local development, base is '/'
  // When building in GitHub Actions, base is '/<repo-name>/'
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  const base = isGithubActions ? `/${repoName}/` : '/';

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto', // Automatically inject service worker registration into index.html
        includeAssets: ['icons/favicon-32.png', 'icons/apple-touch-icon.png'],
        manifest: {
          name: '每日一语',
          short_name: '每日一语',
          description: '把每天的一句话收藏成一张纸条。',
          theme_color: '#f0faf9',
          background_color: '#f0faf9',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'icons/icon-maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          // Dynamic assets to precache (Vite hashed JS/CSS, HTML, assets)
          globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
          // Ensure SPA navigation falls back to index.html in offline mode
          navigateFallback: 'index.html',
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
