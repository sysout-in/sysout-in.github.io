import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')
          if (normalizedId.includes('/node_modules/')) {
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/react-router/') ||
              normalizedId.includes('/node_modules/react-router-dom/')
            ) {
              return 'react'
            }
            if (
              normalizedId.includes('/node_modules/@mui/') ||
              normalizedId.includes('/node_modules/@emotion/')
            ) {
              return 'mui'
            }
            if (normalizedId.includes('/node_modules/axios/')) {
              return 'axios'
            }
          }
          return undefined
        },
      },
    },
  },
})
