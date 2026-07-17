import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Sleep Tracker',
        short_name: 'Sleep Tracker',
        description: 'Simple offline sleep tracking app',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',

        icons: [
          {
            src: '/icons.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
})