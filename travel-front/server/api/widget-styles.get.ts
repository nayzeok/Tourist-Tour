export default defineEventHandler(async (event) => {
  try {
    // Проксируем запрос к стилям виджета
    const response = await fetch('https://new.etm-system.com/widget/style.min.css')

    if (!response.ok) {
      throw new Error(`Failed to fetch widget styles: ${response.statusText}`)
    }

    let css = await response.text()

    // Простое решение: оборачиваем весь CSS в @layer для снижения приоритета
    // или оборачиваем в один большой селектор (может не работать для всех правил)
    // Пробуем более надёжный подход - оборачиваем все селекторы
    css = scopeCSS(css, '#etm-widget-block')

    console.log('[widget-styles] CSS scoped, length:', css.length)

    // Устанавливаем правильные заголовки
    event.node.res.setHeader('Content-Type', 'text/css')
    event.node.res.setHeader('Cache-Control', 'public, max-age=3600') // Кэшируем на 1 час

    return css
  } catch (error) {
    console.error('Error fetching widget styles:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load widget styles'
    })
  }
})

function scopeCSS(css: string, scopeSelector: string): string {
  let result = ''
  let i = 0

  while (i < css.length) {
    // Пропускаем пробелы
    while (i < css.length && /\s/.test(css[i])) {
      i++
    }

    if (i >= css.length) break

    // Ищем начало правила
    let selectorStart = i
    let braceCount = 0
    let selectorEnd = -1

    // Находим открывающую скобку
    while (i < css.length) {
      if (css[i] === '{') {
        selectorEnd = i
        break
      }
      i++
    }

    if (selectorEnd === -1) break

    const selector = css.substring(selectorStart, selectorEnd).trim()
    i++ // пропускаем {

    // Находим соответствующую закрывающую скобку
    const contentStart = i
    braceCount = 1

    while (i < css.length && braceCount > 0) {
      if (css[i] === '{') braceCount++
      else if (css[i] === '}') braceCount--
      i++
    }

    const content = css.substring(contentStart, i - 1).trim()

    // Обрабатываем правило
    if (selector.startsWith('@keyframes') ||
        selector.startsWith('@font-face') ||
        selector.startsWith('@charset') ||
        selector.startsWith('@import')) {
      result += `${selector}{${content}}`
    }
    else if (selector.startsWith('@media') ||
             selector.startsWith('@supports') ||
             selector.startsWith('@container')) {
      // Рекурсивно обрабатываем содержимое @media и подобных
      const scopedContent = scopeCSS(content, scopeSelector)
      result += `${selector}{${scopedContent}}`
    }
    else {
      // Обычное CSS правило - добавляем scope к селектору
      const selectorList = selector.split(',').map(s => s.trim())

      const scopedSelectors = selectorList.map(sel => {
        if (!sel || sel.includes(scopeSelector)) return sel

        // Для :root, html, body добавляем scope в начало
        if (sel.match(/^(:root|html|body)(\s|$|:|\.|\[|#)/)) {
          return `${scopeSelector} ${sel}`
        }

        return `${scopeSelector} ${sel}`
      }).join(',')

      result += `${scopedSelectors}{${content}}`
    }
  }

  return result
}
