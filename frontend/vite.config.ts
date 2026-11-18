import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, type VitePluginPWAAPI } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'
import path from 'path'

const pwaPlugins = VitePWA({
  registerType: 'prompt',
  manifest: {
    name: 'Finku',
    short_name: 'Finku',
    description: 'Personal finance tracker',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#FAFAF8',
    theme_color: '#C0392B',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api(?:\/|$)/],
    cleanupOutdatedCaches: true,
  },
})

const pwaApi = (
  pwaPlugins[0] as Plugin & { api: VitePluginPWAAPI }
).api

const filterWebManifestFromPrecache: Plugin = {
  name: 'finku-filter-web-manifest-from-precache',
  buildStart() {
    pwaApi.extendManifestEntries((entries) =>
      entries.filter((entry) => {
        const url = typeof entry === 'string' ? entry : entry.url
        return url !== 'manifest.webmanifest'
      }),
    )
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...pwaPlugins,
    filterWebManifestFromPrecache,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})