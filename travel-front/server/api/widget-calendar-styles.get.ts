export default defineEventHandler(async (event) => {
  try {
    // Получаем оригинальные стили виджета
    const response = await fetch('https://new.etm-system.com/widget/style.min.css')

    if (!response.ok) {
      throw new Error(`Failed to fetch widget styles: ${response.statusText}`)
    }

    const css = await response.text()

    // Возвращаем стили БЕЗ scoping и БЕЗ @layer
    // Календарь и другие position:fixed элементы будут иметь свои оригинальные стили
    console.log('[widget-calendar-styles] Loaded full widget styles without scoping, length:', css.length)

    // Устанавливаем правильные заголовки
    event.node.res.setHeader('Content-Type', 'text/css')
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600') // Кэшируем на 1 час

    return css
  } catch (error) {
    console.error('Error fetching widget calendar styles:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load widget calendar styles'
    })
  }
})
