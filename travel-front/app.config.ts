export default defineAppConfig({
  ui: {
    colorMode: false,

    colors: {
      primary: 'primary',
    },

    icons: {
      loading: 'mingcute:loading-fill',
      calendar: 'lucide:calendar',
      arrowRight: 'iconamoon:arrow-right-2',
      arrowLeft: 'iconamoon:arrow-left-2',
    },

    button: {
      slots: {
        base: 'rounded-xl',
        leadingIcon: 'text-neutral-500',
      },
    },
  },
})
