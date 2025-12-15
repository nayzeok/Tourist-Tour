export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/Favicon/favicon.ico',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/Favicon/favicon-16x16.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/Favicon/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/Favicon/android-chrome-192x192.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/Favicon/android-chrome-512x512.png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/Favicon/apple-touch-icon.png',
        },
        {
          rel: 'manifest',
          href: '/Favicon/site.webmanifest',
        },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/icon',
    'nuxt-viewport',
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  image: {
    provider: 'ipx',
    dir: './public',
    format: ['webp'],
    quality: 90,

    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    baseURL: '/',
  },

  css: ['~/assets/styles/main.css'],

  colorMode: {
    preference: 'light',
  },

  components: {
    dirs: [
      {
        path: '~/src/shared/ui',
        pathPrefix: false,
        extensions: ['.vue'],
      },
      {
        path: '~/src/entities',
        pathPrefix: false,
        extensions: ['.vue'],
      },
      {
        path: '~/src/features',
        pathPrefix: false,
        extensions: ['.vue'],
      },
      {
        path: '~/src/widgets',
        pathPrefix: false,
        extensions: ['.vue'],
      },
    ],
  },

  vite: {
    plugins: [
      {
        name: 'vite-plugin-glob-transform',
        transform(code: string, id: string) {
          if (id.includes('nuxt-icons')) {
            return code.replace(
              /as:\s*['"]raw['"]/g,
              'query: "?raw", import: "default"'
            )
          }
          return code
        },
      },
    ],
  },

  viewport: {
    breakpoints: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },

    defaultBreakpoints: {
      desktop: 'lg',
      mobile: 'xs',
      tablet: 'md',
    },

    fallbackBreakpoint: 'lg',
  },

  icon: {
    fetchTimeout: 15000,
    serverBundle: false,
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    customCollections: [
      {
        prefix: 'c',
        dir: './assets/icons',
        normalizeIconName: false,
      },
    ],
  },

  dir: {
    layouts: 'src/app/layouts',
    pages: 'src/pages',
    middleware: 'src/app/middleware',
    plugins: 'src/app/plugins',
    app: 'src/',
  },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.BASE_URL || 'https://api.tourist-tours.ru',
    },
  },

  nitro: {
    routeRules: {
      '/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    },
  },

  devtools: { enabled: true, timeline: { enabled: true } },
})
