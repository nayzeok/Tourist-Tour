<script setup lang="ts">
import { onMounted, ref } from 'vue'

declare global {
  interface Window {
    FlightsSearchWidget?: {
      init: (options: {
        nemoURL: string
        rootElement: HTMLElement
        locale?: string
      }) => void
    }
  }
}

const WIDGET_SCRIPT_SRC =
  'https://cdn.nemo.travel/search-form/latest/flights.search.widget.min.js'
const WIDGET_STYLE_HREF =
  'https://cdn.nemo.travel/search-form/latest/flights.search.widget.min.css'
const FONT_STYLE_HREF =
  'https://fonts.googleapis.com/css?family=Open+Sans:400,500,600,700&subset=cyrillic'

const rootEl = ref<HTMLElement | null>(null)

const ensureStylesheet = (href: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLLinkElement | null
    if (existing) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`))
    document.head.appendChild(link)
  })

const ensureScript = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing) {
      if (window.FlightsSearchWidget) {
        resolve()
        return
      }

      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error(`Failed to load script: ${src}`)),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })

onMounted(async () => {
  if (!rootEl.value) {
    return
  }

  try {
    await Promise.all([
      ensureStylesheet(FONT_STYLE_HREF, 'nemo-widget-font'),
      ensureStylesheet(WIDGET_STYLE_HREF, 'nemo-widget-style'),
    ])
    await ensureScript(WIDGET_SCRIPT_SRC, 'nemo-widget-script')

    if (!rootEl.value) {
      return
    }

    rootEl.value.innerHTML = ''

    window.FlightsSearchWidget?.init({
      nemoURL: 'https://aviatickets.tourist-tours.ru/',
      rootElement: rootEl.value,
      locale: 'ru',
    })
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <div class="container">
    <div ref="rootEl" class="avia-widget-root" />
  </div>
</template>

<style scoped>
:global(.widget) {
  font-family: 'inter', Arial, sans-serif;
  font-size: inherit;
  color: #f2f2f2;
  border-radius: 0;
  padding: 35px;
  background: #003cff !important;
  border-width: 0;
  border-color: #ffffff;
  z-index: 9999;
  max-width: 100%;
  max-height: 100%;
}

:global(body .widget-airports__select__wrapper .is-searchable .Select-control) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .widget-dates__col) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .react-datepicker__input-container) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .widget-ui-dropdown__trigger) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .widget-passengers__content) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .widget__startButton) {
  border-radius: 8px !important;
  overflow: hidden;
  color: #000 !important;
}

:global(body .widget__routeTypeSwitch span) {
  color: #ffffff !important;
}

:global(body .widget-ui-datepicker) {
  border-radius: 8px !important;
  overflow: hidden;
}

:global(body .Select-menu-outer) {
  border-radius: 12px !important;
  overflow: hidden;
}

:global(.widget .btn-primary) {
  background-color: #0c4bfe;
  color: #ffffff;
  border-radius: 5px;
}

:global(.widget__routeTypeSwitch span) {
  cursor: pointer;
  padding-left: 22px;
  color: #194890;
}

:global(.widget-airports__select .Select-control) {
  cursor: pointer;
  border-radius: 5px;
  height: 40px;
  border-color: #ccc !important;
}

:global(.widget .form-control) {
  border-radius: 5px;
}

:global(.widget .widget-ui-datepicker .react-datepicker__month-container) {
  width: 100%;
  float: none;
  display: block;
  padding: 20px 0 0;
  z-index: 9999;
}

:global(.widget-passengers__trigger) {
  border: none;
  background: #fff;
  border-radius: 8px;
}

:global(body .widget-classType__inner__button) {
  border: none;
  border-radius: 8px;
}

:global(body .widget-ui-datepicker__footer__button) {
  border-radius: 8px;
}

:global(body .widget-segments__segment__drop) {
  border-radius: 8px;
}

:global(body .widget-segments__segment__drop:before) {
  color: #000 !important;
}

:global(body .widget__addSegment) {
  border: none;
  border-radius: 8px;
}

:global(
  body
    .react-datepicker__day.widget-ui-datepicker__specialDay.react-datepicker__day--thu.react-datepicker__day--selected.react-datepicker__day--today
) {
  border: none;
  border-radius: 8px;
}
</style>

