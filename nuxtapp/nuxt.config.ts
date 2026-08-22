import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000/api'
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
