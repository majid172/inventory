import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://inventory-1yf7.onrender.com/api'
    }
  },
  modules: [
    '@pinia/nuxt'
  ],
  css: [
    '~/assets/css/pos.css'
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
})
