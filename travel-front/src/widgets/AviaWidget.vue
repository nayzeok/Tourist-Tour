<template>
  <div class="container py-10">
    <div class="etm-widget-wrapper" :class="{ 'widget-expanded': isExpanded }">
      <div
          id="etm-widget-block"
          data-currency="RUB"
          data-locale="RU"
          data-sid="e510c89c83"
          data-url="https://aviatickets.tourist-tours.ru"
      >
        <div id="etm-widget-app"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isExpanded = ref(false)
let observer: MutationObserver | null = null

// Загружаем стили виджета через прокси для обхода CORS
const loadWidgetStyles = () => {
  const linkId = 'etm-widget-styles'
  if (document.getElementById(linkId)) {
    console.log('✅ Widget styles already loaded')
    return
  }

  // Используем прокси API для загрузки стилей (обход CORS)
  const stylesUrl = '/api/widget-styles'
  console.log('📥 Loading widget styles from:', stylesUrl)

  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = stylesUrl

  link.onload = () => {
    console.log('✅ Widget styles loaded successfully via proxy')
  }

  link.onerror = (error) => {
    console.error('❌ Failed to load widget styles via proxy:', error)
    console.log('Trying direct URL as fallback...')

    // Пытаемся загрузить напрямую как fallback
    link.href = 'https://new.etm-system.com/widget/style.min.css'
  }

  document.head.appendChild(link)
}

// Загружаем скрипт виджета
const loadWidgetScript = () => {
  return new Promise<void>((resolve, reject) => {
    const scriptId = 'etm-widget-script'
    if (document.getElementById(scriptId)) {
      console.log('✅ Widget script already loaded')
      resolve()
      return
    }

    console.log('📥 Loading widget script from:', 'https://new.etm-system.com/widget/app.min.js')

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://new.etm-system.com/widget/app.min.js'
    script.onload = () => {
      console.log('✅ Widget script loaded successfully')
      resolve()
    }
    script.onerror = () => {
      console.error('❌ Failed to load widget script')
      reject(new Error('Failed to load widget script'))
    }
    document.body.appendChild(script)
  })
}

// Проверяем открытые выпадающие элементы
const checkDropdowns = () => {
  const calendar = document.querySelector('.etm-calendar-wrap')
  const seats = document.querySelector('.seats-option.drop-down')
  const autocomplete = document.querySelector('.autocomplete-list')

  const hasOpenDropdown = !!(
      (calendar && window.getComputedStyle(calendar).display !== 'none') ||
      (seats && window.getComputedStyle(seats).display !== 'none') ||
      (autocomplete && window.getComputedStyle(autocomplete).display !== 'none')
  )

  isExpanded.value = hasOpenDropdown
}

onMounted(async () => {
  try {
    // Загружаем стили и скрипт
    loadWidgetStyles()
    await loadWidgetScript()

    // Инициализируем наблюдатель за изменениями DOM
    setTimeout(() => {
      observer = new MutationObserver(() => {
        checkDropdowns()
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }, 1000)

    // Проверяем при кликах
    document.addEventListener('click', () => {
      setTimeout(checkDropdowns, 100)
      setTimeout(checkDropdowns, 300)
    })
  } catch (error) {
    console.error('Error loading ETM widget:', error)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.etm-widget-wrapper {
  width: 100%;
  min-height: 350px;
  border-radius: 16px;
  overflow: visible;
  transition: min-height 0.3s ease;
}

.etm-widget-wrapper.widget-expanded {
  min-height: 800px;
}

@media screen and (max-width: 768px) {
  .etm-widget-wrapper {
    min-height: 400px;
  }

  .etm-widget-wrapper.widget-expanded {
    min-height: 900px;
  }
}
</style>

<style>
/* ========================================
   ПОЛНЫЕ СТИЛИ КАЛЕНДАРЯ ИЗ ОРИГИНАЛЬНОГО ВИДЖЕТА
   ======================================== */
.daterange{font-family:"Roboto",sans-serif;position:relative}.daterange.disable .calendar-wrapper{opacity:.6}.daterange__wrap{display:block}.daterange__title{font-size:12px;text-align:left;font-weight:400;color:#2c2c2c;margin:0;padding-left:9px}.daterange__title.required::after{content:"*";font-size:12px;color:#ff8584;top:-2px;position:relative}.daterange__calendar{width:max-content;display:flex;position:absolute;background-color:#fff;z-index:999999 !important}.daterange__error{font-size:12px;color:rgba(208,2,27,.65);margin-top:3px;font-weight:500}.daterange__input{padding:11px 0 13px 9px;line-height:12px;border:1px solid #e1e1e1;margin-top:0;font-weight:500;width:100%;outline:none;box-sizing:border-box;background:#ffffff50;color:#fff}.daterange__input.error{outline:rgba(208,2,27,.65) solid 1px}.daterange__input:focus{outline:none}.daterange__input:focus::-webkit-input-placeholder{color:transparent}.daterange__input:focus::-moz-placeholder{color:transparent}.daterange__input:focus:-ms-input-placeholder{color:transparent}.daterange__input__hotels{font-size:14px;font-weight:400;padding:0 9px;height:42px}.daterange .calendar{background-color:#fff;width:230px}.daterange .calendar-all{box-shadow:0px 0px 3px 2px #e3e4e9}.daterange .calendar-bottom{padding:12px 22px;border-top:solid 1px #f6f7f9}.daterange .calendar-checkbox{display:flex;align-items:center;cursor:pointer}.daterange .calendar-checkbox input[type=checkbox]{display:none}.daterange .calendar-checkbox__box{width:18px;height:18px;object-fit:contain;border:2px solid #e3e4e9;box-sizing:border-box;position:relative}.daterange .calendar-checkbox input[type=checkbox]:checked~.calendar-checkbox__box{background-image:url("../img/check.svg");border:none}.daterange .calendar-checkbox__text{font-size:12px;color:#3a3a3a;line-height:16px;margin-left:8px}.daterange .calendar__set-windows{margin-top:25px}.daterange .calendar-wrapper{width:max-content;padding:25px 30px;position:relative}.daterange .calendar-buttons{margin-bottom:15px;display:flex;align-items:center;justify-content:center;color:#ff8584}.daterange .calendar-buttons>*{border:1px solid #ff8584;padding:5px;cursor:pointer;font-size:14px;line-height:14px;padding:11px 3px;border-radius:2px;min-width:107px;text-align:center}.daterange .calendar-buttons>*:first-child{border-top-left-radius:2px;border-bottom-left-radius:2px}.daterange .calendar-buttons>*:last-child{border-top-right-radius:2px;border-bottom-right-radius:2px}.daterange .calendar-buttons>*.active{background-color:#ff8584;color:#fff}.daterange .calendar-main .calendar__month{font-size:16px;color:#2c2c2c;line-height:25px}.daterange .calendar-main .calendar__month.doubled-left{margin-left:-80px}.daterange .calendar-main .calendar__month.doubled-right{margin-right:-80px}.daterange .calendar-main__calendars{display:flex}.daterange .calendar__selects{display:flex;justify-content:space-between;align-items:center}.daterange .calendar-right{margin-left:19px}.daterange .calendar-top__nav{display:flex;align-items:center;justify-content:space-between}.daterange .calendar-date{border-collapse:collapse;width:100%}.daterange .calendar-date td{vertical-align:middle;text-align:center}.daterange .calendar-date__day-names{display:flex;justify-content:space-around;font-size:12px;font-weight:500;margin-bottom:20px;margin-top:25px}.daterange .arrow{padding:12px;position:relative;cursor:pointer}.daterange .arrow::after,.daterange .arrow::before{content:"";display:block;background-color:#8c96ab;opacity:.25;height:7px;width:2px;position:absolute;top:50%;left:50%}.daterange .arrow::before{transform:translate(-50%, -50%) rotate(45deg)}.daterange .arrow::after{transform:translate(-50%, -50%) rotate(-45deg)}.daterange .arrow__left::before{top:40%;left:calc(50% - 2px)}.daterange .arrow__left::after{top:60%;left:calc(50% - 2px)}.daterange .arrow__right{transform:rotate(180deg)}.daterange .arrow__right::after{top:60%}.daterange .arrow__right::before{top:40%}.daterange .day-cell{cursor:pointer;font-size:12px;padding:8px 7px}.daterange .day-cell.active{background-color:#ff8584;color:#fff}.daterange .day-cell.hovered{background-color:#ffeded}.daterange .day-cell.disabled{color:#e3e4e9;cursor:default}.daterange .option-select{display:flex;align-items:center}.daterange .option-select__option{color:#ff8584;font-weight:bold;font-size:14px;cursor:pointer;text-decoration:underline}.daterange .set-cell{padding:8px;color:#202020;cursor:pointer;font-size:14px}.daterange .set-cell.active{background-color:#ff8584;font-weight:bold;color:#fff}.daterange .set-cell.disabled{cursor:default;opacity:.25}.daterange .set-window__wrap{display:flex;align-items:center}.daterange .set-window__cells{width:100%}.daterange .set-window__cells td{padding:6px;text-align:center}

/* Стили кнопок виджета */
.etm-calendar-wrap .button,.etm-calendar .button{display:inline-block;font-weight:500;background:#ff8584;color:#fff;min-width:88px;box-sizing:border-box;padding:11px 10px 9px;text-align:center;cursor:pointer;border-radius:2px;border-width:1px;border-radius:8px;border-style:solid;border-color:#ff8584}.etm-calendar-wrap .button:hover,.etm-calendar .button:hover{opacity:.85}.etm-calendar-wrap .button_inverse,.etm-calendar .button_inverse{border:1px solid #ff8584;background-color:transparent !important;background-image:none;color:#ff8584}.etm-calendar-wrap .button_action-color,.etm-calendar .button_action-color{background-color:#f7bd41;border-color:#f7bd41}.etm-calendar-wrap .button_action-color.button_inverse,.etm-calendar .button_action-color.button_inverse{color:#f7bd41;background-color:transparent}.etm-calendar-wrap .button.disabled,.etm-calendar .button.disabled{pointer-events:none}

/* Стили для ETM календаря */
.etm-calendar-wrap,
.etm-datepicker,
.etm-calendar {
  z-index: 999999 !important;
  font-family: "Roboto", sans-serif !important;
  background: #fff !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Базовые стили для всех элементов виджета (включая position:fixed элементы) */
[class*="etm-"],
[class*="daterange"],
[class*="calendar"],
[class*="datepicker"],
[class*="seats-option"],
[class*="autocomplete"],
[class*="v-select"] {
  box-sizing: border-box !important;
}

/* ========================================
   КАСТОМНЫЕ ЦВЕТА ДЛЯ ВИДЖЕТА
   ======================================== */

body #etm-widget-block .button_action-color {
  background-color: #f05922 !important;
  border-color: #f05922 !important;
}

body #etm-widget-block .search-panel {
  background: #fafafa !important;
}

body #etm-widget-block .seats-option__comfort .comfort__class_active {
  background-color: #f05922 !important;
  color: #fff !important;
  border-color: #f05922 !important;
}

body #etm-widget-block .seats-option__minus::after,
body #etm-widget-block .seats-option__plus::after {
  background-color: #fff !important;
  color: #f05922 !important;
  border-color: #f05922 !important;
}

body #etm-widget-block .seats-option__comfort .comfort__class {
  border: 1px solid #f05922 !important;
}

body #etm-widget-block .seats-option__adult,
body #etm-widget-block .seats-option__child,
body #etm-widget-block .seats-option__baby {
  text-align: left !important;
}

@media screen and (max-width: 768px) {
  .etm-calendar-wrap {
    height: 65vh !important;
    margin-top: 15px !important;
  }
}
</style>