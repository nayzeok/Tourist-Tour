/**
 * Composable для работы с URL изображений
 * Преобразует относительные URL в абсолютные с API base
 */
export function useImageUrl() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || ''

  /**
   * Преобразует URL изображения в абсолютный URL с API base
   * Если URL уже абсолютный (начинается с http), возвращает как есть
   * Если URL относительный (/api/images/...), добавляет API base URL
   */
  function getImageUrl(url: string | undefined | null): string {
    if (!url) return ''

    // Если уже абсолютный URL — возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    // Для относительных URL добавляем API base
    if (url.startsWith('/')) {
      return `${apiUrl}${url}`
    }

    return `${apiUrl}/${url}`
  }

  /**
   * Преобразует массив URL изображений
   */
  function getImageUrls(urls: string[] | undefined | null): string[] {
    if (!urls || !Array.isArray(urls)) return []
    return urls.map(getImageUrl)
  }

  return {
    getImageUrl,
    getImageUrls,
  }
}
