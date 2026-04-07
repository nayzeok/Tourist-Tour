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

    calendar: {
      slots: {
        root: 'rounded-none overflow-hidden',
      },
    },

    popover: {
      slots: {
        content: 'bg-default shadow-lg rounded-none ring ring-default data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-popover-content-transform-origin) focus:outline-none pointer-events-auto',
      },
    },
  },
})
